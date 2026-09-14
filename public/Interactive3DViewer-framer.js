/**
 * -----------------------------------------------------------------------------
 * Interactive3DViewer with File & Image Import Support
 * Compatible with Framer (https://framer.com) & React
 *
 * Supports:
 * - 3D Models: .glb, .gltf with full OrbitControls, Auto-rotate & Lighting
 * - Images in 3D: .png, .jpg, .webp, .svg rendered on interactive 3D surface
 * - User File Upload / Drag & Drop directly on published Framer sites
 * -----------------------------------------------------------------------------
 */

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer";

export default function Interactive3DViewer(props) {
  const {
    modelFile: initialModelFile,
    backgroundColor = "#09090b",
    autoRotate = true,
    cameraControls = true,
    shadowIntensity = 1,
    exposure = 1,
    environmentImage = "neutral",
    allowUserUpload = true,
  } = props;

  const isStatic = useIsStaticRenderer();
  const shouldAutoRotate = !isStatic && autoRotate;

  // State for user uploaded file
  const [activeUrl, setActiveUrl] = React.useState(initialModelFile || "https://modelviewer.dev/shared-assets/models/Astronaut.glb");
  const [fileType, setFileType] = React.useState("model"); // "model" | "image"
  const [fileName, setFileName] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // Sync with Framer property control changes
  React.useEffect(() => {
    if (initialModelFile) {
      setActiveUrl(initialModelFile);
      setFileType("model");
      setFileName(initialModelFile.split("/").pop() || "model.glb");
    }
  }, [initialModelFile]);

  // Inject @google/model-viewer script
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const scriptId = "google-model-viewer-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  // Process file upload (3D or Image)
  const handleFile = React.useCallback((file) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isImage = ["png", "jpg", "jpeg", "webp", "svg"].includes(ext);
    const is3D = ["glb", "gltf"].includes(ext);

    if (!isImage && !is3D) {
      alert("Format non supporté. Importez un fichier .glb, .gltf ou une image .png, .jpg");
      return;
    }

    const url = URL.createObjectURL(file);
    setActiveUrl(url);
    setFileType(isImage ? "image" : "model");
    setFileName(file.name);
  }, []);

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return _jsxs("div", {
    onDragOver: allowUserUpload ? onDragOver : undefined,
    onDragLeave: allowUserUpload ? onDragLeave : undefined,
    onDrop: allowUserUpload ? onDrop : undefined,
    style: {
      position: "relative",
      width: "100%",
      height: "100%",
      minHeight: "420px",
      backgroundColor,
      borderRadius: "20px",
      overflow: "hidden",
      fontFamily: "Inter, -apple-system, sans-serif",
      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
      border: isDragging ? "2px dashed #ffffff" : "1px solid rgba(255,255,255,0.12)",
      transition: "border 0.2s ease",
    },
    children: [
      // Hidden file input
      allowUserUpload &&
        _jsx("input", {
          ref: fileInputRef,
          type: "file",
          accept: ".glb,.gltf,.png,.jpg,.jpeg,.webp,.svg",
          onChange: onFileInputChange,
          style: { display: "none" },
        }),

      // Top Floating Bar (Import button & active file pill)
      allowUserUpload &&
        _jsxs("div", {
          style: {
            position: "absolute",
            top: "16px",
            left: "16px",
            right: "16px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "none",
          },
          children: [
            fileName &&
              _jsxs("div", {
                style: {
                  pointerEvents: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(24, 24, 27, 0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "600",
                },
                children: [
                  _jsx("span", {
                    style: {
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                    },
                  }),
                  fileName,
                  _jsx("span", {
                    style: {
                      fontSize: "9px",
                      opacity: 0.6,
                      textTransform: "uppercase",
                    },
                    children: fileType === "image" ? "Image 3D" : "Modèle 3D",
                  }),
                ],
              }),

            _jsxs("button", {
              type: "button",
              onClick: () => fileInputRef.current?.click(),
              style: {
                pointerEvents: "auto",
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "999px",
                backgroundColor: "#ffffff",
                color: "#09090b",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                transition: "transform 0.15s ease",
              },
              children: [
                _jsx("span", { children: "⤒" }),
                _jsx("span", { children: "Importer un fichier" }),
              ],
            }),
          ],
        }),

      // 3D Model Rendering via <model-viewer>
      fileType === "model" && activeUrl
        ? _jsx("model-viewer", {
            src: activeUrl,
            style: { width: "100%", height: "100%", outline: "none" },
            ...(shouldAutoRotate ? { "auto-rotate": true } : {}),
            ...(cameraControls ? { "camera-controls": true } : {}),
            "shadow-intensity": shadowIntensity,
            exposure: exposure,
            "environment-image": environmentImage,
            loading: "eager",
          })
        : // 3D Image Rendering (Holographic Card with 3D CSS Perspective & Lighting)
          _jsx("div", {
            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              perspective: "1200px",
            },
            children: _jsx("div", {
              style: {
                position: "relative",
                maxWidth: "80%",
                maxHeight: "75%",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                transform: "rotateY(12deg) rotateX(8deg)",
                transition: "transform 0.4s ease-out",
              },
              children: _jsx("img", {
                src: activeUrl,
                alt: "Image en 3D",
                style: {
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxHeight: "380px",
                  objectFit: "contain",
                },
              }),
            }),
          }),

      // Bottom Helper Text
      allowUserUpload &&
        _jsx("div", {
          style: {
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            pointerEvents: "none",
            fontSize: "11px",
            color: "rgba(255, 255, 255, 0.5)",
            backgroundColor: "rgba(9, 9, 11, 0.75)",
            padding: "6px 14px",
            borderRadius: "999px",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            whiteSpace: "nowrap",
          },
          children: "Glissez ou importez un modèle 3D (.glb, .gltf) ou une image (.png, .jpg)",
        }),
    ],
  });
}

Interactive3DViewer.defaultProps = {
  modelFile: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  backgroundColor: "#09090b",
  autoRotate: true,
  cameraControls: true,
  shadowIntensity: 1,
  exposure: 1,
  environmentImage: "neutral",
  allowUserUpload: true,
};

addPropertyControls(Interactive3DViewer, {
  modelFile: {
    type: ControlType.File,
    title: "Modèle 3D",
    allowedFileTypes: ["glb", "gltf"],
  },
  allowUserUpload: {
    type: ControlType.Boolean,
    title: "Import Fichier",
    defaultValue: true,
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Fond",
    defaultValue: "#09090b",
  },
  autoRotate: {
    type: ControlType.Boolean,
    title: "Auto-Rotate",
    defaultValue: true,
  },
  cameraControls: {
    type: ControlType.Boolean,
    title: "Contrôles",
    defaultValue: true,
  },
  shadowIntensity: {
    type: ControlType.Number,
    title: "Ombres",
    defaultValue: 1,
    min: 0,
    max: 3,
    step: 0.1,
  },
  exposure: {
    type: ControlType.Number,
    title: "Exposition",
    defaultValue: 1,
    min: 0,
    max: 3,
    step: 0.1,
  },
  environmentImage: {
    type: ControlType.Enum,
    title: "Environnement",
    defaultValue: "neutral",
    options: ["neutral", "legacy"],
    optionTitles: ["Neutre", "Legacy"],
  },
});
