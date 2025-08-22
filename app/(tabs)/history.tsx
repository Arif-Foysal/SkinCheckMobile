import { Image } from 'expo-image';
import { StyleSheet, ScrollView, View, Alert, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import {
  Surface,
  Card,
  Text,
  Button,
  Chip,
  Avatar,
  IconButton,
  SegmentedButtons,
  Portal,
  Dialog,
  Divider,
  List,
  ActivityIndicator,
} from 'react-native-paper';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { makeAuthenticatedRequest, API_ENDPOINTS } from '@/utils/api';

// Type definitions for API response
interface Upload {
  id: number;
  created_at: string;
  user_uuid: string;
  file_name: string;
  localization: string;
  file_hash: string;
  url: string;
  prediction_result: string | null;
  prediction_confidence: number;
}

interface ApiResponse {
  uploads: Upload[];
}

type FilterType = 'all' | 'benign' | 'malignant' | 'pending';
type SortType = 'newest' | 'oldest' | 'confidence';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [allUploads, setAllUploads] = useState<Upload[]>([]); // Store all data from API
  const [displayedUploads, setDisplayedUploads] = useState<Upload[]>([]); // Currently displayed data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  
  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch all uploads from API once, then handle pagination client-side
  const fetchAllUploads = async () => {
    if (!user?.access_token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest(
        API_ENDPOINTS.PREDICT_HISTORY,
        user.access_token
      );

      const data: ApiResponse = await response.json();
      setAllUploads(data.uploads || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      if (error instanceof Error && error.message === 'Unauthorized') {
        // Handle session expiry - could trigger logout here
        setAllUploads([]);
        return;
      }
      
      Alert.alert('Error', 'Failed to load scan history. Please try again.');
      setAllUploads([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filtering and sorting
  const getFilteredAndSortedUploads = useCallback(() => {
    let filtered = allUploads;

    // Apply filters
    if (filter !== 'all') {
      filtered = filtered.filter((upload: Upload) => {
        if (filter === 'pending') return upload.prediction_result === null;
        return upload.prediction_result?.toLowerCase() === filter;
      });
    }

    // Apply sorting
    filtered = filtered.sort((a: Upload, b: Upload) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'confidence':
          return (b.prediction_confidence || 0) - (a.prediction_confidence || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allUploads, filter, sort]);

  // Update displayed uploads when filters/sort change or when loading more
  useEffect(() => {
    const filteredAndSorted = getFilteredAndSortedUploads();
    const endIndex = currentPage * pageSize;
    setDisplayedUploads(filteredAndSorted.slice(0, endIndex));
  }, [allUploads, filter, sort, currentPage, getFilteredAndSortedUploads]);

  // Check if there are more pages available
  const hasMorePages = useMemo(() => {
    const totalFiltered = getFilteredAndSortedUploads().length;
    return currentPage * pageSize < totalFiltered;
  }, [currentPage, pageSize, getFilteredAndSortedUploads]);

  useEffect(() => {
    fetchAllUploads();
  }, [user]);

  // Pull-to-refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchAllUploads();
    setRefreshing(false);
  }, [user?.access_token]);

  // Load more function for pagination
  const loadMore = useCallback(() => {
    if (hasMorePages && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMorePages, loading]);

  // Since filtering and sorting is now handled client-side, use displayedUploads
  const filteredAndSortedUploads = displayedUploads;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBadgeColor = (result: string | null) => {
    if (!result) return '#ff9800'; // Orange for pending
    return result.toLowerCase() === 'malignant' ? '#f44336' : '#4caf50';
  };

  const getResultDisplayText = (result: string | null) => {
    if (!result) return 'Pending';
    return result;
  };

  const getDetailDescription = (upload: Upload) => {
    if (!upload.prediction_result) {
      return 'Analysis is still in progress. Please check back later for results.';
    }
    
    const confidence = Math.round(upload.prediction_confidence * 100);
    const location = upload.localization ? `on ${upload.localization}` : '';
    
    if (upload.prediction_result.toLowerCase() === 'malignant') {
      return `The analysis of the skin lesion ${location} shows suspicious characteristics that require immediate medical attention. Confidence level: ${confidence}%.`;
    } else {
      return `The analysis of the skin lesion ${location} shows characteristics consistent with a benign condition. Confidence level: ${confidence}%.`;
    }
  };

  const handleViewDetails = (upload: Upload) => {
    setSelectedUpload(upload);
    setDetailDialogVisible(true);
  };

  const handleDelete = (upload: Upload) => {
    setSelectedUpload(upload);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedUpload || !user?.access_token) return;
    
    try {
      // TODO: Replace with your actual delete API endpoint when available
      // Example: DELETE https://skincheck-yy0v.onrender.com/upload/{id}
      // await makeAuthenticatedRequest(
      //   `${API_ENDPOINTS.UPLOADS}${selectedUpload.id}`,
      //   user.access_token,
      //   { method: 'DELETE' }
      // );
      
      // For now, just remove from local state
      // Remove the deleted upload from the list
      setAllUploads(allUploads.filter((upload: Upload) => upload.id !== selectedUpload.id));
      Alert.alert('Deleted', 'Scan has been removed from your history.');
    } catch (error) {
      console.error('Error deleting upload:', error);
      if (error instanceof Error && error.message === 'Unauthorized') {
        // Handle session expiry
        return;
      }
      Alert.alert('Error', 'Failed to delete scan. Please try again.');
    } finally {
      setDeleteDialogVisible(false);
      setSelectedUpload(null);
    }
  };

  const handleShare = () => {
    Alert.alert(
      'Privacy Warning',
      'Sharing medical information may compromise your privacy. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Sharing...') }
      ]
    );
  };

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyState}>
      <Avatar.Icon size={80} icon="image-search" style={styles.emptyIcon} />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No scans yet
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Upload an image to get started with skin analysis!
      </ThemedText>
      <Button 
        mode="contained" 
        style={styles.emptyButton}
        onPress={() => router.push('/(tabs)/scan')}
        icon="camera"
      >
        Start Scanning
      </Button>
    </ThemedView>
  );

  const renderUploadCard = (upload: Upload) => (
    <ThemedView key={upload.id} style={styles.stepContainer}>
      <Surface style={styles.predictionCard} elevation={2}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Image 
              source={{ uri: upload.url }} 
              style={styles.thumbnail}
            />
          </View>
          
          <View style={styles.cardMiddle}>
            <Text variant="bodyMedium" style={styles.dateText}>
              {formatDate(upload.created_at)}
            </Text>
            
            <View style={styles.locationContainer}>
              <Text variant="bodySmall" style={styles.locationText}>
                Location: {upload.localization || 'Not specified'}
              </Text>
            </View>
            
            <View style={styles.resultContainer}>
              <Chip 
                mode="flat" 
                style={[styles.resultChip, { backgroundColor: getBadgeColor(upload.prediction_result) }]}
                textStyle={styles.chipText}
              >
                {getResultDisplayText(upload.prediction_result)}
              </Chip>
              {upload.prediction_result && (
                <Text variant="bodySmall" style={styles.confidenceText}>
                  {Math.round(upload.prediction_confidence * 100)}% confidence
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.cardRight}>
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => handleDelete(upload)}
            />
          </View>
        </Card.Content>
        
        <Card.Actions>
          <Button 
            mode="outlined" 
            onPress={() => handleViewDetails(upload)}
            style={styles.viewDetailsButton}
          >
            View Details
          </Button>
        </Card.Actions>
      </Surface>
    </ThemedView>
  );

  if (loading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <Surface style={styles.headerImageContainer} elevation={0}>
            <Avatar.Icon size={120} icon="history" style={styles.headerIcon} />
          </Surface>
        }>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading scan history...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Surface style={styles.headerImageContainer} elevation={0}>
          <Avatar.Icon size={120} icon="history" style={styles.headerIcon} />
        </Surface>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Prediction History</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.subtitleContainer}>
        <ThemedText style={styles.subtitle}>
          {getFilteredAndSortedUploads().length > displayedUploads.length ? (
            `Showing ${displayedUploads.length} of ${getFilteredAndSortedUploads().length} scan${getFilteredAndSortedUploads().length !== 1 ? 's' : ''}`
          ) : (
            `${displayedUploads.length} scan${displayedUploads.length !== 1 ? 's' : ''} found`
          )}
        </ThemedText>
        {refreshing && (
          <ActivityIndicator size="small" style={styles.refreshIndicator} />
        )}
      </ThemedView>

      {/* Filter and Sort Controls */}
      <Surface style={styles.controls} elevation={2}>
        <View style={styles.controlHeader}>
          <Text variant="labelMedium" style={styles.controlLabel}>
            Filter by:
          </Text>
          <Button 
            mode="outlined" 
            onPress={onRefresh} 
            loading={refreshing}
            disabled={refreshing}
            icon="refresh"
            compact
            style={styles.refreshButton}
          >
            {refreshing ? 'Refreshing' : 'Refresh'}
          </Button>
        </View>
        <SegmentedButtons
          value={filter}
          onValueChange={(value: string) => {
            setFilter(value as FilterType);
            // Reset pagination when filter changes
            setCurrentPage(1);
          }}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'benign', label: 'Benign' },
            { value: 'malignant', label: 'Malignant' },
            { value: 'pending', label: 'Pending' },
          ]}
          style={styles.segmentedButtons}
        />
        
        <Text variant="labelMedium" style={styles.controlLabel}>
          Sort by:
        </Text>
        <SegmentedButtons
          value={sort}
          onValueChange={(value: string) => {
            setSort(value as SortType);
            // Reset pagination when sort changes
            setCurrentPage(1);
          }}
          buttons={[
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' },
            { value: 'confidence', label: 'Confidence' },
          ]}
          style={styles.segmentedButtons}
        />
      </Surface>

      {/* Uploads List or Empty State */}
      <ThemedView style={styles.contentContainer}>
        {filteredAndSortedUploads.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {filteredAndSortedUploads.map(renderUploadCard)}
            
            {/* Load More Button */}
            {hasMorePages && (
              <ThemedView style={styles.loadMoreContainer}>
                <Button
                  mode="outlined"
                  onPress={loadMore}
                  loading={loading}
                  disabled={loading}
                  icon="chevron-down"
                  style={styles.loadMoreButton}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </ThemedView>
            )}
            
            {/* End of results indicator */}
            {!hasMorePages && displayedUploads.length > 0 && (
              <ThemedView style={styles.endIndicatorContainer}>
                <Text variant="bodySmall" style={styles.endIndicatorText}>
                  No more scans to load
                </Text>
              </ThemedView>
            )}
          </>
        )}
      </ThemedView>

      {/* Detail Dialog */}
      <Portal>
        <Dialog 
          visible={detailDialogVisible} 
          onDismiss={() => setDetailDialogVisible(false)}
          style={styles.detailDialog}
        >
          {selectedUpload && (
            <View>
              <Dialog.Content>
                <Image 
                  source={{ uri: selectedUpload.url }} 
                  style={styles.detailImage}
                />
                
                <View style={styles.detailHeader}>
                  <Text variant="headlineSmall" style={styles.detailTitle}>
                    Analysis Result
                  </Text>
                  <Chip 
                    mode="flat" 
                    style={[styles.detailChip, { backgroundColor: getBadgeColor(selectedUpload.prediction_result) }]}
                    textStyle={styles.chipText}
                  >
                    {getResultDisplayText(selectedUpload.prediction_result)}
                  </Chip>
                </View>
                
                {selectedUpload.prediction_result && (
                  <Text variant="bodyLarge" style={styles.confidenceScore}>
                    Confidence: {Math.round(selectedUpload.prediction_confidence * 100)}%
                  </Text>
                )}
                
                <Divider style={styles.divider} />
                
                <Text variant="bodyMedium" style={styles.detailDescription}>
                  {getDetailDescription(selectedUpload)}
                </Text>
                
                {selectedUpload.prediction_result?.toLowerCase() === 'malignant' && (
                  <Surface style={styles.warningBox}>
                    <List.Item
                      title="Medical Advice"
                      description="If prediction is malignant, consult a dermatologist immediately."
                      left={(props: any) => <List.Icon {...props} icon="alert" color="#f44336" />}
                      titleStyle={styles.warningTitle}
                      descriptionStyle={styles.warningDescription}
                    />
                  </Surface>
                )}
                
                                {selectedUpload.prediction_result?.toLowerCase() === 'malignant' && (
                  <Surface style={styles.warningBox}>
                    <List.Item
                      title="Medical Advice"
                      description="If prediction is malignant, consult a dermatologist immediately."
                      left={(props: any) => <List.Icon {...props} icon="alert" color="#f44336" />}
                      titleStyle={styles.warningTitle}
                      descriptionStyle={styles.warningDescription}
                    />
                  </Surface>
                )}
                
                <Text variant="bodySmall" style={styles.timestamp}>
                  Scanned on {formatDate(selectedUpload.created_at)}
                </Text>
              </Dialog.Content>
              
              <Dialog.Actions>
                <Button onPress={() => setDetailDialogVisible(false)}>
                  Close
                </Button>
                <Button mode="outlined" onPress={handleShare}>
                  Share
                </Button>
                <Button 
                  mode="contained" 
                  buttonColor="#f44336"
                  onPress={() => {
                    setDetailDialogVisible(false);
                    handleDelete(selectedUpload);
                  }}
                >
                  Delete
                </Button>
              </Dialog.Actions>
            </View>
          )}
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Scan</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this scan? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" buttonColor="#f44336" onPress={confirmDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // Header styles matching index.tsx
  headerImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitleContainer: {
    marginBottom: 16,
  },
  subtitle: {
    opacity: 0.7,
  },
  
  // Controls section matching Paper demo pattern
  controls: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlLabel: {
    marginBottom: 8,
    marginTop: 8,
    fontWeight: '600',
  },
  refreshButton: {
    marginLeft: 8,
  },
  refreshIndicator: {
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  
  // Content container
  contentContainer: {
    gap: 8,
    marginBottom: 8,
  },
  
  // Pagination
  loadMoreContainer: {
    margin: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  endIndicatorContainer: {
    margin: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  endIndicatorText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  
  // Loading state
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  
  // Step container pattern from index.tsx
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  
  // Location text
  locationContainer: {
    marginBottom: 4,
  },
  locationText: {
    opacity: 0.6,
    fontSize: 11,
  },
  
  // Empty State
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    margin: 16,
  },
  emptyIcon: {
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  
  // Prediction Cards
  predictionCard: {
    margin: 16,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cardLeft: {
    marginRight: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  cardMiddle: {
    flex: 1,
  },
  dateText: {
    marginBottom: 4,
    opacity: 0.7,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  resultChip: {
    marginRight: 8,
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidenceText: {
    opacity: 0.7,
    fontSize: 12,
  },
  cardRight: {
    alignItems: 'center',
  },
  viewDetailsButton: {
    marginVertical: 4,
  },
  
  // Detail Dialog
  detailDialog: {
    margin: 16,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  detailChip: {
    height: 32,
  },
  confidenceScore: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  detailDescription: {
    lineHeight: 22,
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  warningTitle: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  warningDescription: {
    color: '#d32f2f',
  },
  timestamp: {
    opacity: 0.6,
    textAlign: 'center',
  },
});
