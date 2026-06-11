"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function HomeAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1. Entrance: avatar pops, SVG strokes draw on, hero lines rise
      const entrance = gsap.timeline({
        defaults: { ease: "power2.out" },
      })

      entrance.fromTo(
        '[data-animate="avatar"]',
        { y: 12 },
        { y: 0, opacity: 1, duration: 0.5 },
      )

      const strokes = gsap.utils.toArray<SVGGeometryElement>(
        '[data-animate="avatar"] svg [stroke]',
      )
      strokes.forEach((el) => {
        const len = el.getTotalLength()
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
      })
      if (strokes.length) {
        entrance.to(
          strokes,
          { strokeDashoffset: 0, duration: 0.6, stagger: 0.08 },
          0.15,
        )
      }

      entrance.fromTo(
        '[data-animate="hero-line"]',
        { y: 16 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 },
        0.2,
      )

      // 2. Section reveals: anything already in view at load animates right
      //    after the hero entrance (a clamped ScrollTrigger at scroll 0 sits
      //    at progress 0 and would wait for the first scroll); the rest
      //    reveal as they enter the viewport
      gsap.utils
        .toArray<HTMLElement>('[data-animate="reveal"]')
        .forEach((el) => {
          gsap.fromTo(
            el,
            { y: 20 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power2.out",
              ...(ScrollTrigger.isInViewport(el)
                ? { delay: 0.35 }
                : {
                    scrollTrigger: {
                      trigger: el,
                      // clamp() keeps the trigger reachable near page edges
                      start: "clamp(top bottom)",
                      once: true,
                    },
                  }),
            },
          )
        })

      // 3. Code snippet typing effect
      const codeLines = gsap.utils.toArray<HTMLElement>(
        '[data-animate="code-line"]',
      )
      const caret = document.querySelector('[data-animate="code-caret"]')
      if (codeLines.length) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: '[data-animate="code-window"]',
              start: "top 80%",
              once: true,
            },
          })
          .to(codeLines, {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.375,
            stagger: 0.125,
            ease: "none",
          })
          // caret sits at the end of the last line and blinks once typing ends
          .call(() => caret?.classList.add("typing"), undefined, "+=0.1")
      }
    })
  })

  return null
}
