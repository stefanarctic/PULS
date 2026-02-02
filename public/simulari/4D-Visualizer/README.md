# 4D Visualizer

A powerful web-based tool for visualizing 4-dimensional objects in 3D space using THREE.js. This project allows you to explore complex 4D geometries like tesseracts, hyperspheres, and Klein bottles through interactive 3D projections.

## Features

- **Multiple 4D Models**: Tesseract (4D cube), Hypersphere, Hyperplane, and Klein Bottle
- **Interactive Controls**: Rotate objects in all 4 dimensions (X, Y, Z, W)
- **Multiple Projections**: Perspective, Orthographic, and Stereographic projections
- **Real-time Animation**: Auto-rotation with customizable speed
- **Modern UI**: Clean, responsive interface with real-time parameter display
- **Color Mapping**: Dynamic coloring based on 4D coordinates

## Getting Started

### Prerequisites

- A modern web browser with WebGL support
- Python 3.x (for local development server)

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Start a local development server:

```bash
# Using Python 3
python -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Or using Node.js (if you have it installed)
npx http-server
```

4. Open your browser and navigate to `http://localhost:8000`

### Alternative Setup

If you have Node.js installed:

```bash
npm install
npm start
```

## Usage

### Controls

- **Model Selection**: Choose from different 4D objects using the dropdown menu
- **Rotation Controls**: Use the sliders to rotate the object around different axes:
  - X-axis Rotation: Traditional 3D rotation around X-axis
  - Y-axis Rotation: Traditional 3D rotation around Y-axis  
  - Z-axis Rotation: Traditional 3D rotation around Z-axis
  - W-axis Rotation: 4D rotation around W-axis
- **Projection Type**: Switch between different projection methods
- **Animation Speed**: Control the speed of auto-rotation
- **Auto Rotation**: Toggle automatic rotation on/off
- **Reset View**: Return to the default view

### Mouse Controls

- **Left Click + Drag**: Rotate the camera around the object
- **Right Click + Drag**: Pan the camera
- **Scroll Wheel**: Zoom in/out

## Technical Details

### 4D Mathematics

The visualizer implements several key mathematical concepts:

1. **4D Vectors**: Extended 3D vectors with a W component
2. **4D Rotation Matrices**: 4x4 matrices for rotating in 4D space
3. **Projection Algorithms**: Methods to project 4D objects into 3D space
4. **Color Mapping**: Visual representation of 4D coordinates

### Projection Methods

- **Perspective Projection**: Projects 4D points by dividing by the W coordinate
- **Orthographic Projection**: Simply drops the W coordinate
- **Stereographic Projection**: Projects 4D sphere to 3D space

### Supported Models

1. **Tesseract**: A 4D hypercube with 16 vertices and 32 edges
2. **Hypersphere**: A 4D sphere with parametric surface generation
3. **Hyperplane**: A flat 4D surface projected to 3D
4. **Klein Bottle**: A non-orientable 4D surface

## File Structure

```
4D-Visualizer/
├── index.html              # Main HTML file
├── package.json            # Project configuration
├── README.md              # This file
└── js/
    ├── 4DGeometry.js      # 4D geometry classes
    ├── 4DProjection.js   # Projection algorithms
    ├── 4DVisualizer.js   # Main visualizer class
    └── main.js            # Application entry point
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires WebGL support for 3D rendering.

## Contributing

Feel free to contribute to this project by:

1. Adding new 4D models
2. Implementing additional projection methods
3. Improving the user interface
4. Adding new visualization features
5. Optimizing performance

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- THREE.js for the 3D rendering framework
- Mathematical concepts from 4D geometry and topology
- Inspiration from various 4D visualization projects

## Troubleshooting

### Common Issues

1. **Black screen**: Ensure your browser supports WebGL
2. **Slow performance**: Try reducing the resolution in the model constructors
3. **Controls not working**: Check browser console for JavaScript errors

### Performance Tips

- Use lower resolution models for better performance
- Disable auto-rotation if experiencing frame drops
- Close other browser tabs to free up GPU memory

## Future Enhancements

- Additional 4D models (hyperboloid, torus, etc.)
- VR/AR support
- Export functionality for 3D models
- Advanced lighting and shading
- Interactive 4D slicing
- Real-time model generation
