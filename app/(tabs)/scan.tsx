import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { 
  Button, 
  Card, 
  Text, 
  Surface, 
  ActivityIndicator, 
  FAB, 
  Portal, 
  Dialog,
  IconButton,
  ProgressBar,
  Chip,
} from 'react-native-paper';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/utils/api';

// API Response interface
interface PredictionResponse {
  prediction: string;
  confidence: number;
  probabilities: {
    Benign: number;
    Malignant: number;
  };
}

export default function ScanScreen() {
  const { user } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [image, setImage] = useState<string | null>(null);
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PredictionResponse | null>(null);
  const [localization, setLocalization] = useState<string>('face'); // Default localization
  
  // Use useFocusEffect to manage camera lifecycle
  useFocusEffect(
    useCallback(() => {
      // When the screen comes into focus
      setIsCameraActive(true);
      
      // Cleanup function when screen goes out of focus
      return () => {
        setIsCameraActive(false);
      };
    }, [])
  );
  
  // Request permissions if not already granted
  const ensurePermissions = async () => {
    if (!cameraPermission?.granted) {
      await requestCameraPermission();
    }
    if (!mediaPermission?.granted) {
      await requestMediaPermission();
    }
  };

  // Take a picture with the camera
  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setImage(photo.uri);
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    ensurePermissions();
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Analyze the image with real API
  const analyzeImage = async () => {
    if (!user?.access_token) {
      Alert.alert('Error', 'Please log in to analyze images.');
      return;
    }

    if (!image) {
      Alert.alert('Error', 'No image selected.');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Create form data for the API request
      const formData = new FormData();
      
      // Extract filename from URI or use a default
      const filename = image.split('/').pop() || 'skin_image.jpg';
      const fileExtension = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('image', {
        uri: image,
        type: mimeType,
        name: filename,
      } as any);

      // Build the URL with localization parameter
      const url = `${API_ENDPOINTS.PREDICT}?localization=${localization}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please log in again.');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: PredictionResponse = await response.json();
      setAnalysisResult(result);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Reset the image preview and analysis results
  const resetImage = () => {
    setImage(null);
    setAnalysisResult(null);
  };

  if (!cameraPermission) {
    return (
      <Surface style={styles.container}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <Surface style={styles.permissionContainer}>
        <Card style={styles.permissionCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.permissionTitle}>
              Camera Permission Required
            </Text>
            <Text variant="bodyMedium" style={styles.permissionText}>
              We need camera permission to analyze skin conditions and help with early detection.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={requestCameraPermission}>
              Grant Permission
            </Button>
          </Card.Actions>
        </Card>
      </Surface>
    );
  }

  if (image) {
    return (
      <Surface style={styles.previewContainer}>
        <Card style={styles.imageCard}>
          <Card.Title title="Image Analysis" />
          <Card.Content>
            <Image source={{ uri: image }} style={styles.preview} />
            
            {!analyzing && !analysisResult && (
              <View style={styles.localizationContainer}>
                <Text variant="bodyMedium" style={styles.localizationTitle}>
                  Select body area:
                </Text>
                <View style={styles.localizationChips}>
                  {['face', 'ear', 'neck', 'arm', 'leg', 'torso', 'back', 'hand', 'foot', 'other'].map((area) => (
                    <Chip
                      key={area}
                      mode={localization === area ? 'flat' : 'outlined'}
                      selected={localization === area}
                      onPress={() => setLocalization(area)}
                      style={styles.localizationChip}
                    >
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
            
            {analyzing && (
              <Surface style={styles.analysisProgress}>
                <Text variant="bodyMedium" style={styles.analysisText}>
                  Analyzing image...
                </Text>
                <ProgressBar indeterminate style={styles.progressBar} />
              </Surface>
            )}
            
            {analysisResult && !analyzing && (
              <Surface style={styles.resultContainer}>
                <Text variant="headlineSmall" style={styles.resultTitle}>
                  Analysis Results
                </Text>
                
                <View style={styles.predictionContainer}>
                  <Chip 
                    mode="flat"
                    style={[
                      styles.predictionChip,
                      analysisResult.prediction === 'Malignant' 
                        ? styles.malignantChip 
                        : styles.benignChip
                    ]}
                    textStyle={styles.predictionText}
                  >
                    {analysisResult.prediction}
                  </Chip>
                  
                  <Text variant="bodyLarge" style={styles.confidenceText}>
                    Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
                
                <View style={styles.probabilitiesContainer}>
                  <Text variant="bodyMedium" style={styles.probabilitiesTitle}>
                    Detailed Probabilities:
                  </Text>
                  <View style={styles.probabilityRow}>
                    <Text style={styles.probabilityLabel}>Benign:</Text>
                    <Text style={styles.probabilityValue}>
                      {(analysisResult.probabilities.Benign * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.probabilityRow}>
                    <Text style={styles.probabilityLabel}>Malignant:</Text>
                    <Text style={styles.probabilityValue}>
                      {(analysisResult.probabilities.Malignant * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
                
                <Surface style={styles.warningContainer}>
                  <Text variant="bodySmall" style={styles.warningText}>
                    ⚠️ This is an AI screening tool only. Always consult a healthcare professional for proper diagnosis and treatment.
                  </Text>
                </Surface>
              </Surface>
            )}
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="outlined" 
              onPress={resetImage}
              disabled={analyzing}
            >
              {analysisResult ? 'New Scan' : 'Cancel'}
            </Button>
            {!analysisResult && (
              <Button 
                mode="contained" 
                onPress={analyzeImage}
                disabled={analyzing}
                loading={analyzing}
              >
                Analyze
              </Button>
            )}
          </Card.Actions>
        </Card>
        
        <Text variant="bodySmall" style={styles.disclaimer}>
          Disclaimer: This app is for screening purposes only. Always consult a healthcare professional.
        </Text>
        
        {/* Floating Action Button for retaking picture */}
        <FAB
          icon="camera"
          style={styles.fab}
          onPress={() => {
            resetImage();
            // Small delay to ensure state is reset before showing camera
            setTimeout(() => setIsCameraActive(true), 100);
          }}
          label="Retake"
          disabled={analyzing}
        />
      </Surface>
    );
  }

  return (
    <View style={styles.container}>
      {isCameraActive && (
        <CameraView
          style={styles.camera}
          facing="back"
          ref={(ref: CameraView | null) => setCamera(ref)}
        />
      )}
      
      <View style={styles.overlay}>
        <View style={styles.rectangle} />
      </View>
      
      <View style={styles.instructions}>
        <ThemedText style={styles.instructionText}>
          Position the skin area in the frame
        </ThemedText>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
           <IconButton icon="image" iconColor="#fff" size={28} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <View style={{ width: 80 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  permissionCard: {
    margin: 16,
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  imageCard: {
    marginTop: 20,
  },
  analysisProgress: {
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  analysisText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rectangle: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  instructions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  galleryButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'white',
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginVertical: 8,
  },
  localizationContainer: {
    marginTop: 16,
  },
  localizationTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  localizationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  localizationChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  disclaimer: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
    paddingHorizontal: 16,
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  resultTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  predictionContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionChip: {
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  benignChip: {
    backgroundColor: '#4CAF50',
  },
  malignantChip: {
    backgroundColor: '#F44336',
  },
  predictionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confidenceText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  probabilitiesContainer: {
    marginBottom: 16,
  },
  probabilitiesTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  probabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  probabilityLabel: {
    fontSize: 14,
  },
  probabilityValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#6200ee',
  },
});
