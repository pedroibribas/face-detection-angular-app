import { Component, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-detection',
  templateUrl: './face-detection.component.html',
  styleUrls: ['./face-detection.component.css']
})
export class FaceDetectionComponent implements OnInit {
  state = { message: "", isLoading: false, isDetected: false, isHappy: false };
  imageUrl = "";
  expressions = { angry: 0, disgusted: 0, fearful: 0, happy: 0, neutral: 0, sad: 0, surprised: 0 };

  ngOnInit(): void {
    // # Carregar modelos
    Promise.all([
      faceapi.nets.faceExpressionNet.loadFromUri("/assets/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("./assets/models")
    ]).then(() => console.log("Modelos carregados."));
  }

  detect = async (event: Event) => {
    this.imageUrl = "";
    this.state = { message: "", isLoading: false, isDetected: false, isHappy: false };

    const control = event.currentTarget as HTMLInputElement;
    let imageElement: any;
    this.state.isLoading = true;

    if (this.state.isLoading && control.files) {
      this.state.message = "Detectando sorriso...";
      // Obtém imagem enviada como HTMLImageElement
      imageElement = await faceapi.bufferToImage(control.files[0]);
      this.state.isLoading = false;
    }

    // Obter resultado da detecção
    const results = await faceapi.detectSingleFace(imageElement)
      .withFaceExpressions();

    if (!results) {
      this.state.message = "Nenhum rosto detectado.";
      return console.error({
        message: "Erro ao obter resultados da detecção",
        output: results
      });
    }

    this.state.isDetected = true;
    this.imageUrl = imageElement.src;
    this.expressions = {
      angry: results.expressions.angry,
      disgusted: results.expressions.disgusted,
      fearful: results.expressions.fearful,
      happy: results.expressions.happy,
      neutral: results.expressions.neutral,
      sad: results.expressions.sad,
      surprised: results.expressions.surprised
    };

    const hasSmile = results.expressions.happy >= 1;
    if (!hasSmile) {
      this.state.message = "Nenhum sorriso detectado.";
      (event.target as HTMLInputElement).value = "";
      return console.log({
        message: "Nenhum sorriso detectado",
        output: results.expressions
      });
    }

    this.state.isHappy = true;
    this.state.message = "Sorriso detectado!";
    console.warn({
      message: "Sorriso detectado!",
      output: results.expressions
    });
  }

  onSubmit = (event: FormDataEvent) => {
    event.preventDefault();
    // APAGAR IMAGEM RENDERIZADA
    alert("Fotografia enviada com sucesso.");
  }
}
