import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraCapturedPicture } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { uploadFridgeImageAsync, saveGeneratedRecipes } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import {
  generateRecipesFromImage,
  type GeneratedRecipe,
} from '../lib/openrouter';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipes, setRecipes] = useState<GeneratedRecipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  if (!permission) {
    // still loading permission state
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.subtitle}>
          We need permission to use your camera so the chef can see your fridge.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      // Resize & compress before upload (max width 800px, JPEG 0.7)
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log("image url ", manipulated.uri);
      setPreview(manipulated.uri);
      setRecipes(null);
      setError(null);
      // Next step: upload to Supabase + call OpenRouter
    } catch (error) {
      console.error('Error taking photo', error);
    } finally {
      setIsCapturing(false);
      console.log("preview ", preview);
    }
  };

  const handlePickImage = async () => {
    try {
      setError(null);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Media library permission is required to pick a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsCapturing(true);

      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setPreview(manipulated.uri);
      setRecipes(null);
      setError(null);
      setIsCapturing(false);
    } catch (err) {
      console.error('Error picking image', err);
      setError('Could not pick image. Please try again.');
    }
  };

  const handleUsePhoto = async () => {
    if (!preview || isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      // 1) Upload to Supabase storage and get public URL
      const publicUrl = await uploadFridgeImageAsync(preview, user?.id ?? null);

      // 2) Call OpenRouter to generate recipes
      const result = await generateRecipesFromImage(publicUrl);
      setRecipes(result.recipes);

      // 3) Save into Supabase table (best-effort)
      await saveGeneratedRecipes({
        imageUrl: publicUrl,
        recipes: result.recipes,
        userId: user?.id ?? null,
      });
    } catch (err: any) {
      console.error('Error processing photo', err);
      setError(
        err?.message ||
        'The chef is confused, please try a clearer photo or try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {preview ? (
        <ScrollView
          style={styles.previewContainer}
          contentContainerStyle={styles.previewContent}
        >
          <Image source={{ uri: preview }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { marginRight: 12 }]}
              onPress={() => {
                setPreview(null);
                setRecipes(null);
                setError(null);
              }}
            >
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isProcessing && { opacity: 0.7 },
              ]}
              onPress={handleUsePhoto}
              disabled={isProcessing}
            >
              <Text style={styles.primaryButtonText}>
                {isProcessing ? 'Asking the chef...' : 'Use this photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {isProcessing && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#f97316" />
              <Text style={styles.loaderText}>
                The chef is inspecting your fridge and cooking up recipes...
              </Text>

              <View style={styles.skeletonCard} />
              <View style={styles.skeletonCard} />
              <View style={styles.skeletonCard} />
            </View>
          )}

          {error && !isProcessing && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {recipes && !isProcessing && (
            <View style={styles.recipesContainer}>
              {recipes.map((recipe, index) => (
                <View key={index} style={styles.recipeCard}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeSectionTitle}>Ingredients</Text>
                  {recipe.ingredients.map((item, idx) => (
                    <Text key={idx} style={styles.recipeText}>
                      • {item}
                    </Text>
                  ))}
                  <Text style={styles.recipeSectionTitle}>Instructions</Text>
                  {recipe.instructions.map((step, idx) => (
                    <Text key={idx} style={styles.recipeText}>
                      {idx + 1}. {step}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            flash={flashOn ? 'on' : 'off'}
          />
          <View style={styles.captureOverlay}>
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.smallButton, flashOn && styles.smallButtonActive]}
                onPress={() => setFlashOn((prev) => !prev)}
              >
                <Text style={styles.smallButtonText}>
                  {flashOn ? 'Flash On' : 'Flash Off'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isCapturing && { opacity: 0.6 },
                ]}
                onPress={handleTakePhoto}
                disabled={isCapturing}
              />

              <TouchableOpacity
                style={styles.smallButton}
                onPress={handlePickImage}
                disabled={isCapturing}
              >
                <Text style={styles.smallButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isCapturing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#f97316" />
              <Text style={{color : "#fdfdfdff"}} >Image Processing</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#020617',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  camera: {
    flex: 1,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#f9fafb',
    backgroundColor: '#f97316',
  },
  previewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cameraWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  captureOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  loadingOverlay:{
    ...StyleSheet.absoluteFillObject,
    flex : 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    backgroundColor: '#00000088'
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
  },
  previewImage: {
    flex: 1,
    borderRadius: 12,
    width: '100%',
    height: 320,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  primaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#f97316',
  },
  primaryButtonText: {
    color: '#0b1120',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontWeight: '500',
    fontSize: 16,
  },
  loaderContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: '#e5e7eb',
    textAlign: 'center',
  },
  skeletonCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    height: 100,
    opacity: 0.7,
  },
  errorContainer: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#7f1d1d',
  },
  errorText: {
    color: '#fee2e2',
    textAlign: 'center',
  },
  recipesContainer: {
    marginTop: 24,
    gap: 16,
  },
  recipeCard: {
    borderRadius: 12,
    backgroundColor: '#020617',
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
  },
  recipeSectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  recipeText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'rgba(15,23,42,0.8)',
  },
  smallButtonActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  smallButtonText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '500',
  },
});

