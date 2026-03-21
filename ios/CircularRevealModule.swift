import ExpoModulesCore
import UIKit

public class CircularRevealModule: Module {
    private var overlayView: UIImageView?

    public func definition() -> ModuleDefinition {
        Name("CircularReveal")

        AsyncFunction("triggerTransition") { (centerX: Double, centerY: Double, durationMs: Int, promise: Promise) in
            DispatchQueue.main.async { [weak self] in
                guard let window = UIApplication.shared
                    .connectedScenes
                    .compactMap({ $0 as? UIWindowScene })
                    .flatMap({ $0.windows })
                    .first(where: { $0.isKeyWindow })
                else {
                    promise.reject("ERR_NO_WINDOW", "No key window found")
                    return
                }

                // Capture the full window
                let renderer = UIGraphicsImageRenderer(bounds: window.bounds)
                let image = renderer.image { _ in
                    window.drawHierarchy(in: window.bounds, afterScreenUpdates: false)
                }

                // Remove any existing overlay
                self?.overlayView?.removeFromSuperview()

                // Create overlay with screenshot
                let overlay = UIImageView(image: image)
                overlay.frame = window.bounds
                overlay.contentMode = .scaleToFill
                window.addSubview(overlay)
                self?.overlayView = overlay

                // Wait one frame for overlay to be composited
                DispatchQueue.main.async {
                    // Resolve — JS swaps the theme now
                    promise.resolve("ready")

                    // Wait for theme to render underneath
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                        let cx = centerX
                        let cy = centerY
                        let bounds = window.bounds

                        // Max radius = distance to farthest corner
                        let maxRadius = max(
                            hypot(cx, cy),
                            hypot(bounds.width - cx, cy),
                            hypot(cx, bounds.height - cy),
                            hypot(bounds.width - cx, bounds.height - cy)
                        )

                        let center = CGPoint(x: cx, y: cy)
                        let fullRect = UIBezierPath(rect: bounds)

                        // Start: full rect with NO hole (overlay fully visible)
                        let startHole = UIBezierPath(
                            arcCenter: center, radius: 0.001,
                            startAngle: 0, endAngle: .pi * 2, clockwise: true
                        )
                        let startPath = UIBezierPath(rect: bounds)
                        startPath.append(startHole)
                        startPath.usesEvenOddFillRule = true

                        // End: full rect with MAX hole (overlay invisible)
                        let endHole = UIBezierPath(
                            arcCenter: center, radius: maxRadius,
                            startAngle: 0, endAngle: .pi * 2, clockwise: true
                        )
                        let endPath = UIBezierPath(rect: bounds)
                        endPath.append(endHole)
                        endPath.usesEvenOddFillRule = true

                        let maskLayer = CAShapeLayer()
                        maskLayer.fillRule = .evenOdd
                        maskLayer.path = endPath.cgPath // final state
                        overlay.layer.mask = maskLayer

                        let anim = CABasicAnimation(keyPath: "path")
                        anim.fromValue = startPath.cgPath
                        anim.toValue = endPath.cgPath
                        anim.duration = Double(durationMs) / 1000.0
                        anim.timingFunction = CAMediaTimingFunction(name: .easeOut)
                        anim.isRemovedOnCompletion = false
                        anim.fillMode = .forwards

                        CATransaction.begin()
                        CATransaction.setCompletionBlock {
                            overlay.removeFromSuperview()
                            self?.overlayView = nil
                        }
                        maskLayer.add(anim, forKey: "circularReveal")
                        CATransaction.commit()
                    }
                }
            }
        }
    }
}
