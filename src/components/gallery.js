import addPassiveEventListener from '../utils/addPassiveEventListener';
import safe from '../utils/safe';

safe(() => {
  // eslint-disable-next-line spaced-comment
  const isIE = /*@cc_on!@*/false || !!document.documentMode;
  let lastScrollTop = 0;

  const slider = {
    instance: null,
    mode: null,
    timer: null,
  };

  const initLightbox = mode => {
    const items = document.querySelectorAll('.portfolio__item');

    const lightboxOpen = () => {
      items.forEach(item => {
        const targetW = window.innerWidth * window.devicePixelRatio;
        const img = item.querySelector('.portfolio__img');

        // Set a default value to at least always load something. This will also
        // be used on ultra wide viewports that exceed the size of the largest
        // processed image.
        item.setAttribute('href', img.dataset.src);
        item.setAttribute('data-lightbox', 'portfolio');

        // Find the optimal image size to load; it assumes srcset is listed in
        // descending order by width size.
        img.dataset.srcset
          .split(',')
          .map(opt => opt.trim().split(' '))
          .forEach(([ path, size ]) => {
            if (parseInt(size, 10) > targetW || item.getAttribute('href') === img.dataset.src) {
              item.setAttribute('href', path);
            }
          });
      });
    };

    const lightboxRemove = () => {
      items.forEach(item => {
        item.removeAttribute('data-lightbox');
      });
    };

    items.forEach(el => {
      el.addEventListener('click', e => {
        // Don't follow the anchor.
        e.preventDefault();

        if (isIE) {
          lastScrollTop = document.documentElement.scrollTop;
        }

        if (mode === 'mb') {
          lightboxRemove();
          return;
        }

        let { target } = e;
        while (target && !target.classList.contains('portfolio__item')) {
          target = target.parentNode;
        }

        if (target) {
          if (target.classList.contains('tns-slide-active') && !target.classList.contains('portfolio__item--active')) {
            lightboxRemove();

            if (target.previousElementSibling && target.previousElementSibling.classList.contains('portfolio__item--active')) {
              slider.instance.goTo('next');
            }
            else if (target.nextElementSibling && target.nextElementSibling.classList.contains('portfolio__item--active')) {
              slider.instance.goTo('prev');
            }

            return;
          }
        }

        lightboxOpen();
      });
    });
  };

  const onResize = () => {
    const mode = window.innerWidth >= 768 ? 'dk' : 'mb';
    if (slider.mode === mode) {
      return;
    }

    slider.mode = mode;

    if (slider.instance) {
      slider.instance.destroy();
    }

    slider.instance = window.tns({
      center: true,
      container: '.portfolio__container',
      gutter: 0,
      items: mode === 'dk' ? 2 : 1,
      lazyload: true,
      mouseDrag: false,
      nav: false,
      nextButton: '.portfolio__next',
      prevButton: '.portfolio__previous',

      // This option triggers a Lighthouse warning "Does not use passive
      // listeners to improve scrolling performance", but that's likely an
      // error by Lighthouse. The handlers for this option are supposed to stop
      // scrolling, so they can't be passive. Lighthouse is supposed to filter
      // out handlers that call e.preventDefault(), but that's clearly not
      // happening.
      preventScrollOnTouch: 'auto',
    });

    let previousDisplayIndex;

    const highlightActive = info => {
      const active = info.slideItems.item(info.index);
      const previous = document.querySelector('.portfolio__item--active');

      if (active !== previous) {
        if (previous) {
          previous.classList.remove('portfolio__item--active');
        }

        if (active) {
          // When looping back to the first node, there would be a jumpy
          // transition artifact. We avoid this by disabling the transition
          // momentarily, to allow tns to loop the nodes without visually
          // alerting the user.
          if (previousDisplayIndex === info.displayIndex) {
            active.classList.add('portfolio__item--looped');

            setTimeout(() => {
              active.classList.remove('portfolio__item--looped');
            }, 100);
          }

          active.classList.add('portfolio__item--active');

          // Try to preload the very next picture not yet visible.
          const indexChange = mode === 'dk' ? 2 : 1;
          const preloadItem = idx => {
            const item = info.slideItems.item(idx);
            if (item) {
              const img = item.querySelector('.tns-lazy-img');
              if (img && !img.hasAttribute('src')) {
                img.setAttribute('src', img.dataset.src);
                img.setAttribute('srcset', img.dataset.srcset);
              }
            }
          };

          if (info.index === info.indexCached || info.index > info.indexCached) {
            preloadItem(info.index + indexChange);
          }

          if (info.index === info.indexCached || info.index < info.indexCached) {
            preloadItem(info.index - indexChange);
          }
        }
      }

      previousDisplayIndex = info.displayIndex;
    };

    slider.instance.events.on('indexChanged', info => {
      // Don't break slider if this breaks for some reason.
      safe(() => {
        highlightActive(info);
      });
    });

    // Initial active slider needs to be highlighted.
    highlightActive(slider.instance.getInfo());

    // Our Lightbox helper needs to run every time tns is rebuilt, as it
    // creates new nodes that need new handlers.
    // Lightbox doesn't support responsive images by default, so let's give it a
    // little help.
    initLightbox(mode);
  };

  onResize();
  addPassiveEventListener(window, 'resize', () => {
    if (!slider.timer) {
      slider.timer = setTimeout(() => {
        onResize();
        slider.timer = null;
      });
    }
  });

  window.lightbox.option({
    disableScrolling: true,
    showImageNumberLabel: false,
  });

  // On IE Lightbox jumps to the top of the page. This brings it back to where
  // the image is shown.
  if (isIE) {
    window.addEventListener('scroll', e => {
      if (document.body.classList.contains('lb-disable-scrolling')) {
        if (lastScrollTop !== document.documentElement.scrollTop) {
          document.documentElement.scrollTop = lastScrollTop;
        }
        e.preventDefault();
      }
    }, true);
  }
});
