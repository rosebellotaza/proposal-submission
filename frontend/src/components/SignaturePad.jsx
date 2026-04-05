import { useRef } from "react";

export default function SignaturePad({ setSignature }) {

  const canvasRef = useRef(null);
  let drawing = false;

  const startDraw = () => {
    drawing = true;
  };

  const endDraw = () => {
    drawing = false;

    const canvas = canvasRef.current;
    const data = canvas.toDataURL();

    setSignature(data);
  };

  const draw = (e) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    const rect = canvas.getBoundingClientRect();

    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );

    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="signature-box">

      <h4>Adviser E-Signature</h4>

      <canvas
        ref={canvasRef}
        width="400"
        height="150"
        onMouseDown={startDraw}
        onMouseUp={endDraw}
        onMouseMove={draw}
      />

      <button
        type="button"
        onClick={clearSignature}
      >
        Clear
      </button>

    </div>
  );
}