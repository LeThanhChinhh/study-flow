import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const revealTargets = (targets, options = {}) => {
  const elements = Array.from(targets || [])
  if (elements.length === 0) return null

  gsap.set(elements, {
    autoAlpha: 0,
    y: options.y ?? 20,
    willChange: 'transform, opacity',
  })

  return gsap.to(elements, {
    autoAlpha: 1,
    y: 0,
    duration: options.duration ?? 0.72,
    stagger: options.stagger ?? 0.1,
    ease: options.ease ?? 'power3.out',
    paused: options.paused ?? true,
    onComplete: () => gsap.set(elements, { clearProps: 'willChange' }),
  })
}

const useLandingAnimations = (rootRef) => {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    let cancelled = false
    const media = gsap.matchMedia()
    const select = gsap.utils.selector(root)

    const context = gsap.context(() => {
      media.add(
        {
          desktop: '(min-width: 1024px)',
          compact: '(max-width: 1023px)',
          motion: '(prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (matchContext) => {
          const { desktop, motion, reduced } = matchContext.conditions
          const allAnimatedContent = select(
            '[data-landing-hero-eyebrow], [data-landing-hero-line], [data-landing-hero-copy], [data-landing-hero-actions], [data-landing-hero-layer], [data-landing-problem-item], [data-landing-reveal], [data-landing-showcase-visual], [data-landing-feature-row], [data-landing-final-item], [data-landing-workflow-node]',
          )

          if (reduced || !motion) {
            gsap.set(allAnimatedContent, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              rotation: 0,
              clearProps: 'willChange',
            })
            return undefined
          }

          const nav = select('[data-landing-nav]')[0]
          if (nav) {
            ScrollTrigger.create({
              trigger: root,
              start: 'top -32px',
              end: 'bottom top',
              onEnter: () => gsap.to(nav, {
                backgroundColor: 'rgba(250, 249, 247, 0.9)',
                borderColor: 'rgba(120, 113, 108, 0.14)',
                boxShadow: '0 10px 30px rgba(41, 37, 36, 0.06)',
                duration: 0.28,
                ease: 'power2.out',
                overwrite: true,
              }),
              onLeaveBack: () => gsap.to(nav, {
                backgroundColor: 'rgba(250, 249, 247, 0)',
                borderColor: 'rgba(120, 113, 108, 0)',
                boxShadow: '0 0 0 rgba(41, 37, 36, 0)',
                duration: 0.24,
                ease: 'power2.out',
                overwrite: true,
              }),
            })
          }

          const hero = select('[data-landing-hero]')[0]
          const heroEyebrow = select('[data-landing-hero-eyebrow]')
          const heroLines = select('[data-landing-hero-line]')
          const heroCopy = select('[data-landing-hero-copy]')
          const heroActions = select('[data-landing-hero-actions]')
          const heroLayers = select('[data-landing-hero-layer]')

          gsap.set(heroEyebrow, { autoAlpha: 0, y: 12, willChange: 'transform, opacity' })
          gsap.set(heroLines, { autoAlpha: 0, y: 38, rotationX: -5, transformOrigin: '50% 100%', willChange: 'transform, opacity' })
          gsap.set(heroCopy, { autoAlpha: 0, y: 18, willChange: 'transform, opacity' })
          gsap.set(heroActions, { autoAlpha: 0, y: 16, willChange: 'transform, opacity' })
          gsap.set(heroLayers, { autoAlpha: 0, y: desktop ? 34 : 20, scale: desktop ? 0.97 : 0.99, willChange: 'transform, opacity' })

          const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
          heroTimeline
            .to(heroEyebrow, { autoAlpha: 1, y: 0, duration: 0.5 })
            .to(heroLines, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.82, stagger: 0.1 }, '-=0.22')
            .to(heroCopy, { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.08 }, '-=0.44')
            .to(heroActions, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.32')
            .to(heroLayers, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: desktop ? 0.92 : 0.65,
              stagger: desktop ? 0.08 : 0.04,
              onComplete: () => gsap.set(
                [...heroEyebrow, ...heroLines, ...heroCopy, ...heroActions, ...heroLayers],
                { clearProps: 'willChange' },
              ),
            }, '-=0.58')

          if (desktop && hero) {
            heroLayers
              .filter((layer) => !layer.hasAttribute('data-landing-ambient'))
              .forEach((layer) => {
                const depth = Number(layer.dataset.depth || 0.1)
                gsap.to(layer, {
                  yPercent: -depth * 42,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.65,
                  },
                })
              })

            const ambientElements = select('[data-landing-ambient]')
            const ambientTimeline = gsap.timeline({ repeat: -1, yoyo: true, paused: true })
            ambientElements.forEach((element, index) => {
              ambientTimeline.to(element, {
                y: index % 2 === 0 ? -5 : 5,
                rotation: index % 2 === 0 ? -0.5 : 0.5,
                duration: 2.8 + index * 0.4,
                ease: 'sine.inOut',
              }, 0)
            })

            ScrollTrigger.create({
              trigger: hero,
              start: 'top bottom',
              end: 'bottom top',
              onToggle: (self) => {
                if (self.isActive) {
                  gsap.set(ambientElements, { willChange: 'transform' })
                  ambientTimeline.play()
                } else {
                  ambientTimeline.pause()
                  gsap.set(ambientElements, { clearProps: 'willChange' })
                }
              },
            })
          }

          const problemItems = select('[data-landing-problem-item]')
          if (problemItems.length) {
            const animation = revealTargets(problemItems, { y: 28, stagger: 0.12 })
            ScrollTrigger.create({
              trigger: problemItems[0].closest('.landing-problem'),
              start: 'top 72%',
              once: true,
              animation,
            })
          }

          select('[data-landing-reveal-group]').forEach((group) => {
            const targets = group.querySelectorAll('[data-landing-reveal]')
            if (!targets.length) return
            const animation = revealTargets(targets, { y: 22, stagger: 0.09 })
            ScrollTrigger.create({
              trigger: group,
              start: 'top 78%',
              once: true,
              animation,
            })
          })

          if (desktop) {
            const howSteps = select('[data-landing-how-step]')
            const howVisuals = select('[data-landing-how-visual]')

            const activateHowStep = (stepId) => {
              howSteps.forEach((step) => step.classList.toggle('is-active', step.dataset.landingHowStep === stepId))
              howVisuals.forEach((visual) => {
                const isActive = visual.dataset.landingHowVisual === stepId
                visual.classList.toggle('is-active', isActive)
                gsap.to(visual, {
                  autoAlpha: isActive ? 1 : 0,
                  y: isActive ? 0 : 18,
                  scale: isActive ? 1 : 0.985,
                  duration: 0.42,
                  ease: 'power2.out',
                  overwrite: true,
                  pointerEvents: isActive ? 'auto' : 'none',
                })
              })
            }

            howVisuals.forEach((visual, index) => gsap.set(visual, {
              autoAlpha: index === 0 ? 1 : 0,
              y: index === 0 ? 0 : 18,
              scale: index === 0 ? 1 : 0.985,
            }))

            howSteps.forEach((step) => {
              ScrollTrigger.create({
                trigger: step,
                start: 'top 58%',
                end: 'bottom 42%',
                onEnter: () => activateHowStep(step.dataset.landingHowStep),
                onEnterBack: () => activateHowStep(step.dataset.landingHowStep),
              })
            })
          }

          const showcaseVisual = select('[data-landing-showcase-visual]')[0]
          if (showcaseVisual) {
            gsap.set(showcaseVisual, { autoAlpha: 0, y: 34, scale: 0.975, willChange: 'transform, opacity' })
            ScrollTrigger.create({
              trigger: showcaseVisual,
              start: 'top 82%',
              once: true,
              animation: gsap.to(showcaseVisual, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                ease: 'power3.out',
                paused: true,
                onComplete: () => gsap.set(showcaseVisual, { clearProps: 'willChange' }),
              }),
            })
          }

          const workflowMap = select('[data-landing-workflow-map]')[0]
          const workflowPath = select('[data-landing-workflow-path]')[0]
          const workflowNodes = select('[data-landing-workflow-node]')
          if (workflowMap && workflowPath && workflowNodes.length) {
            if (desktop) {
              const pathLength = workflowPath.getTotalLength()
              gsap.set(workflowPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength })
              gsap.set(workflowNodes, { autoAlpha: 0.42, scale: 0.9, transformOrigin: '50% 50%' })

              const workflowTimeline = gsap.timeline({
                scrollTrigger: {
                  trigger: workflowMap,
                  start: 'top 76%',
                  end: 'bottom 42%',
                  scrub: 0.7,
                },
              })
              workflowTimeline
                .to(workflowPath, { strokeDashoffset: 0, ease: 'none', duration: 1 })
                .to(workflowNodes, { autoAlpha: 1, scale: 1, stagger: 0.16, ease: 'power2.out', duration: 0.5 }, 0.08)
            } else {
              gsap.set(workflowMap, { autoAlpha: 0, y: 20, willChange: 'transform, opacity' })
              ScrollTrigger.create({
                trigger: workflowMap,
                start: 'top 82%',
                once: true,
                animation: gsap.to(workflowMap, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.65,
                  ease: 'power3.out',
                  paused: true,
                  onComplete: () => gsap.set(workflowMap, { clearProps: 'willChange' }),
                }),
              })
            }
          }

          select('[data-landing-feature-row]').forEach((row) => {
            const copy = row.querySelector('.landing-feature-copy')
            const visual = row.querySelector('.landing-feature-visual')
            const direction = row.classList.contains('is-reversed') ? 1 : -1
            const offset = desktop ? 38 : 0

            gsap.set(copy, { autoAlpha: 0, x: offset * direction, y: desktop ? 0 : 18, willChange: 'transform, opacity' })
            gsap.set(visual, { autoAlpha: 0, x: -offset * direction, y: desktop ? 0 : 22, scale: 0.985, willChange: 'transform, opacity' })

            const rowTimeline = gsap.timeline({ paused: true })
              .to(copy, { autoAlpha: 1, x: 0, y: 0, duration: 0.72, ease: 'power3.out' })
              .to(visual, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.82,
                ease: 'power3.out',
                onComplete: () => gsap.set([copy, visual], { clearProps: 'willChange' }),
              }, '-=0.48')

            ScrollTrigger.create({
              trigger: row,
              start: 'top 78%',
              once: true,
              animation: rowTimeline,
            })
          })

          const finalSection = select('[data-landing-final]')[0]
          const finalItems = select('[data-landing-final-item]')
          if (finalSection && finalItems.length) {
            const animation = revealTargets(finalItems, { y: 24, stagger: 0.1, duration: 0.68 })
            ScrollTrigger.create({
              trigger: finalSection,
              start: 'top 76%',
              once: true,
              animation,
            })
          }

          return undefined
        },
      )
    }, root)

    Promise.resolve(document.fonts?.ready).then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      media.revert()
      context.revert()
    }
  }, [rootRef])
}

export default useLandingAnimations
