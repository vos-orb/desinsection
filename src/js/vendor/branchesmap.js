/**
 * BranchesMap class
 */
(function (root) {
  "use strict";

  /**
   * Common object params
   * @type {Object}
   */
  var common = {
      publicMethods: [],
      className: "BranchesMap"
    },
    /**
     * Main constructor
     * @return {Object} - this handle
     */
    Protected = function () {
      var self = this;

      Observer.subscribe("loadPage", function () {
        self.setEvents();
      });

      return this;
    };

  /**
   * Main prototype
   * @type {Object}
   */
  Protected.prototype = {
    ucFirst: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /**
     * Set events to this module.
     * This code fire methods by 'data-action' attribute of '.branchesmap-module-action' element
     */
    setEvents: function () {
      // get action element
      var action = document.querySelector(".branchesmap-module-action");

      if (action) {
        // try to get attribute
        action = "action" + this.ucFirst(action.getAttribute("data-action"));

        // fire event action
        this[action] && this[action]();
      }
    },

    actionIndex: function () {
      [].forEach.call(document.querySelectorAll(".branchesmap-module-action .map"), function (container) {
        if (container.classList.contains("-loaded")) {
          return;
        }
        window.addEventListener("scroll", function () {
          if (Core.isInViewportPartial(container)) {
            container.classList.add("-loaded");
            Core.loadScript("https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.js", function () {
              if (typeof window.mapboxgl === "undefined") {
                return;
              }

              function getConfig(callback) {
                try {
                  var json = atob(container.dataset.settings);
                  var config = JSON.parse(json);
                  callback(config);
                  return;
                } catch (err) {
                  console.error("Failed to parse mapbox config. " + err.message);
                }
              }

              getConfig(function (data) {
                mapboxgl.accessToken = data.accessToken;
                var mapConfig = Object.assign({}, data.mapConfig, {
                  container: container
                });

                const map = new mapboxgl.Map(mapConfig);
                map.on("style.load", () => {
                  map.setFog({}); // Set the default atmosphere style
                });
                map.on("load", () => {
                  map.loadImage(data.markerSrc, function (err, image) {
                    if (err) {
                      console.error("Failed to load mapbox marker image", err);
                      return;
                    }

                    var features = [];
                    [].forEach.call(data.branches, function (city) {
                      features.push({
                        type: "Feature",
                        geometry: {
                          type: "Point",
                          coordinates: [city.lat, city.lng]
                        },
                        properties: {
                          name: city.name,
                          url: city.url
                        }
                      });
                    });

                    map.addImage("branche-marker", image);
                    map.addSource("branches", {
                      type: "geojson",
                      data: {
                        type: "FeatureCollection",
                        features: features
                      }
                    });

                    map.addLayer({
                      id: "branches",
                      type: "symbol",
                      source: "branches",
                      layout: {
                        "icon-image": "branche-marker",
                        "text-field": "{name}",
                        "text-offset": [0, 2],
                        "text-anchor": "top",
                        "text-size": 12,
                        "text-font": ["Open Sans Light"]
                      }
                    });

                    if (document.body.clientWidth >= 1366) {
                      map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
                      map.addControl(
                        new mapboxgl.NavigationControl({ visualizePitch: true, showCompass: false }),
                        "bottom-right"
                      );
                    }
                    map.setLayoutProperty("country-label", "text-field", ["get", "ru"]);
                    // map.on('move', () => {
                    //   console.log(map.getCenter())
                    // });
                    map.on("click", "branches", (e) => {
                      const { features } = e;

                      if (features) {
                        const point = features[0];
                        if (point.geometry.type === "Point") {
                          console.log("Go to " + point.properties.url);
                        }
                      }
                    });
                  });
                });
              });
            });
          }
        });
      });
    }
  };

  /**
   * Encapsulation
   * @return {Object} - this handle
   */
  root[common.className] = function () {
    function construct(constructor, args) {
      function Class() {
        return constructor.apply(this, args);
      }

      Class.prototype = constructor.prototype;
      return new Class();
    }

    var publicly = construct(Protected, arguments),
      i,
      l = common.publicMethods.length;

    for (i = 0; i < l; i += 1) {
      (function () {
        var member = common.publicMethods[i];
        root[common.className].prototype[member] = function () {
          return publicly[member].apply(publicly, arguments);
        };
      })();
    }

    return this;
  };
})(this);

document.addEventListener("DOMContentLoaded", function () {
  window.BranchesMap = new BranchesMap();
});
