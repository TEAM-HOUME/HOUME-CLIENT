import React, { useState, useRef, useCallback } from 'react';

import './App.css';
import { useONNXModel } from './hooks/useONNXModel';
import { ProcessedDetections } from './types';
import { drawDetections, cropDetectionToBlob } from './utils/imageProcessing';

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedDetections | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState<
    'n' | 's' | 's_obj' | 's_obj365'
  >('s_obj365');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const modelPaths = {
    n: '/models/dfine_n_coco.onnx',
    s: '/models/dfine_s_coco.onnx',
    s_obj: '/models/dfine_s_obj2coco.onnx',
    s_obj365: '/models/dfine_s_obj365.onnx',
  };

  const modelInfo = {
    n: {
      name: 'Nano',
      size: '15MB',
      description: '초경량 모델',
      speed: '⚡⚡⚡⚡⚡',
    },
    s: {
      name: 'Small',
      size: '40MB',
      description: '균형잡힌 모델',
      speed: '⚡⚡⚡⚡',
    },
    s_obj: {
      name: 'Small+Obj(COCO)',
      size: '40MB',
      description: 'COCO 80클래스',
      speed: '⚡⚡⚡⚡',
    },
    s_obj365: {
      name: 'Small+Obj365',
      size: '40MB',
      description: '365클래스 가구특화',
      speed: '⚡⚡⚡⚡',
    },
  };

  const { runInference, isLoading, error, progress } = useONNXModel(
    modelPaths[selectedModel]
  );

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResults(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDetect = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const detectionResults = await runInference(imageRef.current);
      setResults(detectionResults);
      // 기본 키워드를 클래스명으로 초기화
      setKeywords(
        detectionResults.detections.map((d) => d.className ?? 'object')
      );

      drawDetections(
        canvasRef.current,
        imageRef.current,
        detectionResults.detections
      );
    } catch (err) {
      console.error('감지 중 오류:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setResults(null);
    setKeywords([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (idx: number) => {
    if (!results || !imageRef.current) return;
    const detection = results.detections[idx];
    const keyword = (keywords[idx] || detection.className || 'object')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\-가-힣]/g, '');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${keyword || 'object'}_${idx + 1}_${stamp}.jpg`;
    const blob = await cropDetectionToBlob(imageRef.current, detection.bbox);
    downloadBlob(blob, filename);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🚀 D-FINE WebML 테스트</h1>
          <p>브라우저에서 실행되는 실시간 객체 감지</p>
          {selectedModel === 's_obj365' && (
            <p
              style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}
            >
              💡 Objects365 순수 모델: 365개 클래스 (가구, 전자제품, 음식, 동물
              등) 감지 가능
            </p>
          )}
          {selectedModel === 's_obj' && (
            <p
              style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}
            >
              📦 Objects365로 사전학습 후 COCO 80클래스로 파인튜닝
            </p>
          )}
          <div className="model-selector">
            <select
              className="model-select"
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(
                  e.target.value as 'n' | 's' | 's_obj' | 's_obj365'
                );
                setResults(null);
              }}
            >
              <option value="s_obj365">
                🌍 Small+Obj365 (40MB) - 365클래스 가구특화 ⚡⚡⚡⚡ [추천]
              </option>
              <option value="s_obj">
                🏠 Small+Obj→COCO (40MB) - COCO 80클래스 ⚡⚡⚡⚡
              </option>
              <option value="n">🚀 Nano (15MB) - 초경량 모델 ⚡⚡⚡⚡⚡</option>
              <option value="s">🎯 Small (40MB) - 균형 모델 ⚡⚡⚡⚡</option>
            </select>
            <p className="model-info">
              현재 모델: {modelInfo[selectedModel].name} (
              {modelInfo[selectedModel].size}) -{' '}
              {modelInfo[selectedModel].description}
            </p>
          </div>
        </header>

        <div className="content">
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>모델 로딩 중... ({progress}%)</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && <div className="error">오류: {error}</div>}

          {!isLoading && !error && (
            <>
              <div className="upload-section">
                <div
                  className={`upload-area ${isDragging ? 'dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="upload-label">
                    📷 이미지를 드래그하거나 클릭하여 업로드
                  </div>
                  <div className="upload-hint">JPG, PNG, GIF 형식 지원</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden-input"
                />
              </div>

              {imageUrl && (
                <>
                  <div className="image-preview">
                    <div className="preview-container">
                      <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="업로드된 이미지"
                        className="preview-image"
                        style={{ display: results ? 'none' : 'block' }}
                      />
                      <canvas
                        ref={canvasRef}
                        className="result-canvas"
                        style={{ display: results ? 'block' : 'none' }}
                      />
                    </div>
                  </div>

                  <div className="controls">
                    <button
                      className="btn btn-primary"
                      onClick={handleDetect}
                      disabled={isProcessing}
                    >
                      {isProcessing ? '처리 중...' : '객체 감지 시작'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleReset}
                      disabled={isProcessing}
                    >
                      초기화
                    </button>
                  </div>

                  {results && (
                    <div className="results-section">
                      <div className="results-header">
                        <h2>감지 결과</h2>
                      </div>

                      <div className="stats">
                        <div className="stat-item">
                          <div className="stat-label">감지된 객체</div>
                          <div className="stat-value">
                            {results.detections.length}개
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label">추론 시간</div>
                          <div className="stat-value">
                            {results.inferenceTime.toFixed(1)}ms
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label">FPS</div>
                          <div className="stat-value">
                            {(1000 / results.inferenceTime).toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {results.detections.length > 0 && (
                        <div className="detection-list">
                          {results.detections.map((detection, idx) => (
                            <div key={idx} className="detection-item">
                              <div className="detection-class">
                                {detection.className}
                              </div>
                              <div className="detection-score">
                                신뢰도: {(detection.score * 100).toFixed(1)}%
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '8px',
                                  alignItems: 'center',
                                  marginTop: '6px',
                                }}
                              >
                                <input
                                  type="text"
                                  value={keywords[idx] ?? ''}
                                  onChange={(e) => {
                                    const next = [...keywords];
                                    next[idx] = e.target.value;
                                    setKeywords(next);
                                  }}
                                  placeholder="파일명 키워드 (예: 소파, 책상)"
                                  style={{ flex: 1, padding: '6px 8px' }}
                                />
                                <button
                                  className="btn btn-primary"
                                  onClick={() => handleDownload(idx)}
                                >
                                  크롭 다운로드
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
