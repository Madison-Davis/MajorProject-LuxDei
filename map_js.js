const map = L.map('map').setView([31.5, 35], 7); // Mediterranean / Israel view

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors & Carto',
}).addTo(map);

const infoBox = document.getElementById("info-box");
const yearLabel = document.getElementById("year-label");
const timelineSlider = document.getElementById("timeline-slider");
let currentTravelLayers = [];

// Data sets
const data = {
  archaeological: [
    { lat: 31.77, lon: 35.21, year: -950, desc: "Temple artifact near Jerusalem" },
    { lat: 34.0, lon: 36.0, year: -800, desc: "Phoenician shipwreck off coast" },
    { lat: 30.5, lon: 34.9, year: -600, desc: "Copper mining tools in Negev" },
    { lat: 35.7, lon: 33.2, year: -200, desc: "Mosaic in Cyprus synagogue" },
    { lat: 32.1, lon: 35.3, year: 150, desc: "Roman-era coin hoard" },
  ],
  events: [
    { lat: 32.7, lon: 35.3, year: -722, desc: "Fall of Samaria to Assyria" },
    { lat: 31.78, lon: 35.24, year: -586, desc: "Destruction of First Temple" },
    { lat: 32.1, lon: 36.1, year: -332, desc: "Alexander's conquest of Levant" },
    { lat: 31.77, lon: 35.21, year: 30, desc: "Crucifixion of Jesus" },
    { lat: 30.0, lon: 31.2, year: 313, desc: "Edict of Milan in Egypt" },
  ],
  pathways: [
    { lat: 33.5, lon: 36.3, year: -1000, desc: "Ancient trade route Damascus" },
    { lat: 31.0, lon: 35.0, year: -700, desc: "Pilgrimage road to Jerusalem" },
    { lat: 36.2, lon: 37.2, year: -500, desc: "Assyrian military path" },
    { lat: 34.3, lon: 35.6, year: -200, desc: "Roman supply route to Tyre" },
    { lat: 33.8, lon: 35.5, year: 100, desc: "Christian missionary route" },
  ],
};

// Store current markers so we can remove them on update
let currentMarkers = {
  archaeological: [],
  events: [],
  pathways: [],
};

// Which layers to show? Controlled by toggles
const show = {
  archaeological: false,
  events: false,
  pathways: false,
  travel: false,
};

// Travel paths with arrowed lines for Jesus' life & ministry
const travelPaths = [
  {
    name: "Nazareth to Jordan River",
    coords: [
      [32.6996, 35.3035], // Nazareth
      [31.8388, 35.4428], // Jordan River (near Bethany)
    ],
    year: 27, // start showing at year 27 AD
  },
  {
    name: "Galilee ministry journey",
    coords: [
      [32.6996, 35.3035], // Nazareth
      [32.7940, 35.4944], // Capernaum
      [32.8570, 35.5050], // Chorazin
      [32.7100, 35.3000], // Back to Nazareth
    ],
    year: 29,
  },
  // Add more journeys here...
];

// Layer group for travel paths
const travelLayer = L.layerGroup().addTo(map);

function addTravelPaths(year) {
  // Clear existing travel path layers first
  currentTravelLayers.forEach(layer => map.removeLayer(layer));
  currentTravelLayers = [];

  travelPaths.forEach(path => {
    if (year >= path.year) {
      const polyline = L.polyline(path.coords, {
        color: "gold",
        weight: 3,
        opacity: 0.7,
      }).addTo(map);
      currentTravelLayers.push(polyline);

      // Add arrowheads on the line
      const decorator = L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: "100%",
            repeat: 0,
            symbol: L.Symbol.arrowHead({
              pixelSize: 10,
              polygon: false,
              pathOptions: { stroke: true, color: "gold" },
            }),
          },
        ],
      }).addTo(map);
      currentTravelLayers.push(decorator);
    }
  });
}


// Update map markers based on year and toggles
function updateMap(year) {
  yearLabel.textContent = year < 0 ? `${-year} BC` : `${year} AD`;

  // Clear existing markers
  Object.keys(currentMarkers).forEach(key => {
    currentMarkers[key].forEach(marker => map.removeLayer(marker));
    currentMarkers[key] = [];
  });

  // Add archaeological markers
  if (show.archaeological) {
    currentMarkers.archaeological = data.archaeological
      .filter(item => item.year <= year)
      .map(item => {
        const marker = L.circleMarker([item.lat, item.lon], { color: "orange" }).addTo(map);
        marker.on('click', () => infoBox.textContent = item.desc);
        return marker;
      });
  }

  // Add event markers
  if (show.events) {
    currentMarkers.events = data.events
      .filter(item => item.year <= year)
      .map(item => {
        const marker = L.circleMarker([item.lat, item.lon], { color: "skyblue" }).addTo(map);
        marker.on('click', () => infoBox.textContent = item.desc);
        return marker;
      });
  }

  // Add pathway markers
  if (show.pathways) {
    currentMarkers.pathways = data.pathways
      .filter(item => item.year <= year)
      .map(item => {
        const marker = L.circleMarker([item.lat, item.lon], { color: "lightgreen" }).addTo(map);
        marker.on('click', () => infoBox.textContent = item.desc);
        return marker;
      });
  }

  if (show.travel) {
    addTravelPaths(year);
  }
}

// Toggle button handlers
document.getElementById("toggle-arch").addEventListener("click", () => {
  show.archaeological = !show.archaeological;
  updateMap(parseInt(timelineSlider.value));
});

document.getElementById("toggle-events").addEventListener("click", () => {
  show.events = !show.events;
  updateMap(parseInt(timelineSlider.value));
});

document.getElementById("toggle-paths").addEventListener("click", () => {
  show.pathways = !show.pathways;
  updateMap(parseInt(timelineSlider.value));
});

document.getElementById("toggle-travel").addEventListener("click", () => {
  show.travel = !show.travel;
  updateMap(parseInt(timelineSlider.value));
});

timelineSlider.addEventListener("input", () => {
  const year = parseInt(timelineSlider.value);
  updateMap(year);
});

// Initial map setup
updateMap(parseInt(timelineSlider.value));
