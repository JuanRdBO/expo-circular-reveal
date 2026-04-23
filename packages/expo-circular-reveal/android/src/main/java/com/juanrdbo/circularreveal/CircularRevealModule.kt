package com.juanrdbo.circularreveal

import android.animation.ValueAnimator
import android.graphics.Bitmap
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.PixelCopy
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.hypot

class CircularRevealModule : Module() {
    private var overlayView: CircularRevealView? = null

    override fun definition() =
        ModuleDefinition {
            Name("CircularReveal")

            AsyncFunction("triggerTransition") { centerX: Double, centerY: Double, durationMs: Int, promise: Promise ->
                val activity = appContext.currentActivity
                if (activity == null) {
                    promise.reject(CodedException("ERR_NO_ACTIVITY", "No current activity", null))
                    return@AsyncFunction
                }

                val handler = Handler(Looper.getMainLooper())
                handler.post {
                    try {
                        val window = activity.window
                        val decorView = window.decorView
                        val width = decorView.width
                        val height = decorView.height

                        if (width <= 0 || height <= 0) {
                            promise.reject(CodedException("ERR_INVALID_SIZE", "View has zero size", null))
                            return@post
                        }

                        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                        val density = activity.resources.displayMetrics.density
                        val cx = (centerX * density).toFloat()
                        val cy = (centerY * density).toFloat()

                        val maxRadius =
                            maxOf(
                                hypot(cx.toDouble(), cy.toDouble()),
                                hypot((width - cx).toDouble(), cy.toDouble()),
                                hypot(cx.toDouble(), (height - cy).toDouble()),
                                hypot((width - cx).toDouble(), (height - cy).toDouble()),
                            ).toFloat()

                        val onCaptured = { capturedBitmap: Bitmap ->
                            handler.post {
                                // Remove any existing overlay
                                overlayView?.let { old ->
                                    (old.parent as? ViewGroup)?.removeView(old)
                                }

                                // Create overlay with circular hole
                                val overlay = CircularRevealView(activity)
                                overlay.bitmap = capturedBitmap
                                overlay.holeCenterX = cx
                                overlay.holeCenterY = cy
                                overlay.holeRadius = 0f // starts with no hole
                                overlay.layoutParams =
                                    FrameLayout.LayoutParams(
                                        ViewGroup.LayoutParams.MATCH_PARENT,
                                        ViewGroup.LayoutParams.MATCH_PARENT,
                                    )

                                val contentView = decorView as ViewGroup
                                contentView.addView(overlay)
                                overlayView = overlay

                                // Wait one frame for overlay to be drawn
                                overlay.post {
                                    // Resolve — JS swaps theme now
                                    promise.resolve("ready")

                                    // Wait for theme to render underneath
                                    overlay.postDelayed({
                                        // Animate the hole from 0 to maxRadius
                                        val animator = ValueAnimator.ofFloat(0f, maxRadius)
                                        animator.duration = durationMs.toLong()
                                        animator.interpolator = DecelerateInterpolator(1.5f)
                                        animator.addUpdateListener { anim ->
                                            overlay.holeRadius = anim.animatedValue as Float
                                        }
                                        animator.addListener(
                                            object : android.animation.AnimatorListenerAdapter() {
                                                override fun onAnimationEnd(animation: android.animation.Animator) {
                                                    contentView.removeView(overlay)
                                                    capturedBitmap.recycle()
                                                    overlayView = null
                                                }
                                            },
                                        )
                                        animator.start()
                                    }, 50)
                                }
                            }
                        }

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            PixelCopy.request(window, bitmap, { result ->
                                if (result == PixelCopy.SUCCESS) {
                                    onCaptured(bitmap)
                                } else {
                                    bitmap.recycle()
                                    promise.reject(CodedException("ERR_PIXEL_COPY", "PixelCopy failed: $result", null))
                                }
                            }, handler)
                        } else {
                            decorView.isDrawingCacheEnabled = true
                            val cache = decorView.drawingCache
                            if (cache != null) {
                                val copy = cache.copy(Bitmap.Config.ARGB_8888, false)
                                decorView.isDrawingCacheEnabled = false
                                bitmap.recycle()
                                onCaptured(copy)
                            } else {
                                decorView.isDrawingCacheEnabled = false
                                bitmap.recycle()
                                promise.reject(CodedException("ERR_CACHE", "Drawing cache null", null))
                            }
                        }
                    } catch (e: Exception) {
                        promise.reject(CodedException("ERR_CAPTURE", e.message ?: "Capture failed", e))
                    }
                }
            }
        }
}
