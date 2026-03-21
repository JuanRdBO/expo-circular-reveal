package com.juanrdbo.circularreveal

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.view.View

/**
 * Draws a bitmap with a circular hole cut out of it.
 * The hole grows from (cx, cy) with the given radius.
 */
class CircularRevealView(context: Context) : View(context) {
    var bitmap: Bitmap? = null
    var holeCenterX: Float = 0f
    var holeCenterY: Float = 0f
    var holeRadius: Float = 0f
        set(value) {
            field = value
            invalidate()
        }

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val clipPath = Path()

    override fun onDraw(canvas: Canvas) {
        val bmp = bitmap ?: return

        // Clip to everything EXCEPT the circle
        clipPath.reset()
        clipPath.addRect(RectF(0f, 0f, width.toFloat(), height.toFloat()), Path.Direction.CW)
        clipPath.addCircle(holeCenterX, holeCenterY, holeRadius, Path.Direction.CCW)
        clipPath.fillType = Path.FillType.EVEN_ODD

        canvas.save()
        canvas.clipPath(clipPath)
        canvas.drawBitmap(bmp, 0f, 0f, paint)
        canvas.restore()
    }
}
