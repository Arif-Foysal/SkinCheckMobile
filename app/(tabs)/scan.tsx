import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScanScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [image, setImage] = useState<string | null>(null);
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
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

  // Analyze the image
  const analyzeImage = () => {
    setAnalyzing(true);
    
    // Simulate API call to your ML model
    setTimeout(() => {
      setAnalyzing(false);
      Alert.alert(
        "Analysis Complete",
        "The AI model suggests this may be a benign skin lesion. Please consult with a dermatologist for a professional diagnosis.",
        [{ text: "OK", onPress: () => setImage(null) }]
      );
    }, 3000);
    
    // In a real app, you would send the image to your backend/API:
    // const formData = new FormData();
    // formData.append('image', {
    //   uri: image,
    //   type: 'image/jpeg',
    //   name: 'skin_image.jpg',
    // });
    // fetch('https://your-api.com/analyze', {
    //   method: 'POST',
    //   body: formData,
    // })
    // .then(response => response.json())
    // .then(data => {
    //   setAnalyzing(false);
    //   // Handle the analysis results
    // })
    // .catch(error => {
    //   setAnalyzing(false);
    //   Alert.alert('Error', 'Failed to analyze image.');
    // });
  };

  // Reset the image preview
  const resetImage = () => {
    setImage(null);
  };

  if (!cameraPermission) {
    return <ThemedView style={styles.container}><ActivityIndicator size="large" /></ThemedView>;
  }

  if (!cameraPermission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.text}>We need camera permission to analyze skin conditions</ThemedText>
        <Button title="Grant Permission" onPress={requestCameraPermission} />
      </ThemedView>
    );
  }

  if (image) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Image Preview</ThemedText>
        <Image source={{ uri: image }} style={styles.preview} />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={resetImage}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.analyzeButton]} 
            onPress={analyzeImage}
            disabled={analyzing}>
            {analyzing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Analyze</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ThemedText style={styles.disclaimer}>
          Disclaimer: This app is for screening purposes only. Always consult a healthcare professional.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {isCameraActive && (
        <CameraView
          style={styles.camera}
          facing="back"
          ref={(ref) => setCamera(ref)}
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
           <IconSymbol size={28} name="image.fill" color='#fff' />
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
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  preview: {
    width: 300,
    height: 300,
    borderRadius: 20,
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
  },
  title: {
    marginTop: 40,
    fontSize: 24,
    marginBottom: 10,
  },
  text: {
    textAlign: 'center',
    marginBottom: 20,
    padding: 20,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    opacity: 0.7,
  },
});
