import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { trpc } from '@/lib/trpc';
import { Play, Pause, RefreshCw, Trash2, Clock, Database, Download, Upload, Plus, Info, Settings, BarChart3 } from 'lucide-react-native';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showAlternativesModal, setShowAlternativesModal] = useState<boolean>(false);
  const [importData, setImportData] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'data' | 'alternatives' | 'analytics'>('overview');
  
  // Default data to prevent undefined errors
  const defaultStatusData = {
    success: true,
    isScrapingAll: false,
    currentSources: { bayut: false, aqar: false, wasalt: false },
    history: [],
    summary: {
      totalProperties: 0,
      lastRun: new Date(Date.now() - 240000).toISOString(),
      sources: { bayut: 0, aqar: 0, wasalt: 0 }
    }
  };
  
  const defaultDataInfoData = {
    success: true,
    totalProperties: 0,
    sourceStats: { bayut: 0, aqar: 0, wasalt: 0, imported: 0 },
    cityStats: {},
    typeStats: {},
    priceRanges: { 'Under 500K': 0, '500K - 1M': 0, '1M - 2M': 0, 'Over 2M': 0 },
    lastUpdated: new Date(),
    dataQuality: { withImages: 0, withDescription: 0, withAgent: 0, complete: 0 }
  };
  
  const defaultAlternativesData = {
    success: true,
    alternatives: { apis: [], tools: [], manual: [] },
    recommendations: [],
    currentLimitations: []
  };
  
  // tRPC queries and mutations - always call in the same order
  const statusQuery = trpc.scraping.getStatus.useQuery(undefined, {
    refetchInterval: 5000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Load failed') || error?.message?.includes('AbortError')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: defaultStatusData,
  });
  
  const dataInfoQuery = trpc.scraping.getDataInfo.useQuery(undefined, {
    retry: (failureCount, error) => {
      if (error?.message?.includes('Load failed') || error?.message?.includes('AbortError')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: defaultDataInfoData,
  });
  
  const alternativesQuery = trpc.scraping.getAlternatives.useQuery(undefined, {
    retry: (failureCount, error) => {
      if (error?.message?.includes('Load failed') || error?.message?.includes('AbortError')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: defaultAlternativesData,
  });
  
  const exportQuery = trpc.scraping.exportJson.useQuery(
    { source: undefined },
    { enabled: false }
  );
  
  const startScrapingMutation = trpc.scraping.start.useMutation({
    onSuccess: (data) => {
      const message = data?.message || 'Scraping completed successfully';
      const propertiesCount = data?.stats?.totalProperties || data?.results?.reduce((sum: number, r: any) => sum + (r.properties?.length || 0), 0) || 0;
      Alert.alert('Success', `${message}\n\nFound ${propertiesCount} properties.`);
      statusQuery.refetch();
      dataInfoQuery.refetch();
    },
    onError: (error) => {
      console.error('Scraping mutation error:', error);
      const errorMessage = error?.message || (error as any)?.data?.message || 'An error occurred during scraping';
      Alert.alert('Scraping Error', errorMessage);
    },
  });
  
  const clearCacheMutation = trpc.scraping.clearCache.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', data?.message || 'Cache cleared successfully');
      statusQuery.refetch();
      dataInfoQuery.refetch();
    },
    onError: (error) => {
      console.error('Clear cache mutation error:', error);
      const errorMessage = error?.message || (error as any)?.data?.message || 'Failed to clear cache';
      Alert.alert('Error', errorMessage);
    },
  });
  
  const importMutation = trpc.scraping.importJson.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', data?.message || 'Data imported successfully');
      setShowImportModal(false);
      setImportData('');
      statusQuery.refetch();
      dataInfoQuery.refetch();
    },
    onError: (error) => {
      console.error('Import mutation error:', error);
      const errorMessage = error?.message || (error as any)?.data?.message || 'Failed to import data';
      Alert.alert('Import Error', errorMessage);
    },
  });
  
  const generateSampleMutation = trpc.scraping.generateSample.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', data?.message || 'Sample data generated successfully');
      statusQuery.refetch();
      dataInfoQuery.refetch();
    },
    onError: (error) => {
      console.error('Generate sample mutation error:', error);
      const errorMessage = error?.message || (error as any)?.data?.message || 'Failed to generate sample data';
      Alert.alert('Error', errorMessage);
    },
  });

  const handleStartScraping = React.useCallback(async (sources?: ('bayut' | 'aqar' | 'wasalt')[]) => {
    setIsLoading(true);
    try {
      const result = await startScrapingMutation.mutateAsync({ sources });
      console.log('Scraping completed:', result);
    } catch (error) {
      console.error('Start scraping error:', error);
      // Error is already handled by the mutation's onError callback
    } finally {
      setIsLoading(false);
    }
  }, [startScrapingMutation]);

  const handleClearCache = React.useCallback(async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all scraped data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearCacheMutation.mutate({ clearHistory: true, clearProperties: true }),
        },
      ]
    );
  }, [clearCacheMutation]);
  
  const handleImportData = React.useCallback(() => {
    if (!importData.trim()) {
      Alert.alert('Error', 'Please enter JSON data to import');
      return;
    }
    
    try {
      JSON.parse(importData); // Validate JSON
      importMutation.mutate({ jsonData: importData, source: undefined });
    } catch (error) {
      Alert.alert('Invalid JSON', 'Please check your JSON format');
    }
  }, [importData, importMutation]);
  
  const handleExportData = React.useCallback(async () => {
    try {
      const result = await exportQuery.refetch();
      if (result.data?.success) {
        Alert.alert('Export Ready', `${result.data.count} properties exported. Data is ready for download.`);
        setShowExportModal(true);
      } else {
        Alert.alert('Export Error', result.data?.message || 'Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export data');
    }
  }, [exportQuery]);
  
  const handleGenerateSample = React.useCallback(() => {
    Alert.alert(
      'Generate Sample Data',
      'How many sample properties would you like to generate?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '20 Properties', onPress: () => generateSampleMutation.mutate({ count: 20 }) },
        { text: '50 Properties', onPress: () => generateSampleMutation.mutate({ count: 50 }) },
        { text: '100 Properties', onPress: () => generateSampleMutation.mutate({ count: 100 }) },
      ]
    );
  }, [generateSampleMutation]);

  // Safely extract data with fallbacks - use useMemo to prevent re-renders
  const status = React.useMemo(() => {
    return statusQuery.data || defaultStatusData;
  }, [statusQuery.data]);
  
  const dataInfo = React.useMemo(() => {
    return dataInfoQuery.data || defaultDataInfoData;
  }, [dataInfoQuery.data]);
  
  const alternatives = React.useMemo(() => {
    return alternativesQuery.data || defaultAlternativesData;
  }, [alternativesQuery.data]);
  
  // Memoized computed values to prevent re-renders
  const isScrapingActive = React.useMemo(() => {
    return status.isScrapingAll || Object.values(status.currentSources || {}).some(Boolean);
  }, [status.isScrapingAll, status.currentSources]);
  
  const isConnected = React.useMemo(() => {
    return (statusQuery.data && dataInfoQuery.data) || (!statusQuery.isError && !dataInfoQuery.isError);
  }, [statusQuery.data, dataInfoQuery.data, statusQuery.isError, dataInfoQuery.isError]);
  
  const connectionError = React.useMemo(() => {
    return statusQuery.error || dataInfoQuery.error;
  }, [statusQuery.error, dataInfoQuery.error]);
  
  // Debug logging with useEffect to prevent re-renders
  React.useEffect(() => {
    console.log('Admin Screen - Query States:', {
      statusQuery: { isLoading: statusQuery.isLoading, isError: statusQuery.isError, data: !!statusQuery.data },
      dataInfoQuery: { isLoading: dataInfoQuery.isLoading, isError: dataInfoQuery.isError, data: !!dataInfoQuery.data },
      alternativesQuery: { isLoading: alternativesQuery.isLoading, isError: alternativesQuery.isError, data: !!alternativesQuery.data }
    });
  }, [statusQuery.isLoading, statusQuery.isError, statusQuery.data, dataInfoQuery.isLoading, dataInfoQuery.isError, dataInfoQuery.data, alternativesQuery.isLoading, alternativesQuery.isError, alternativesQuery.data]);

  const renderOverviewTab = React.useCallback(() => (
    <>
      {/* Status Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>System Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: isScrapingActive ? '#10B981' : '#6B7280' }]} />
          <Text style={styles.statusText}>
            {isScrapingActive ? 'Scraping Active' : 'Idle'}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Database size={20} color="#6B7280" />
            <Text style={styles.statValue}>{status.summary?.totalProperties || 0}</Text>
            <Text style={styles.statLabel}>Total Properties</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{status.summary?.sources?.bayut || 0}</Text>
            <Text style={styles.statLabel}>Bayut</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{status.summary?.sources?.aqar || 0}</Text>
            <Text style={styles.statLabel}>Aqar</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{status.summary?.sources?.wasalt || 0}</Text>
            <Text style={styles.statLabel}>Wasalt</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => handleStartScraping()}
          disabled={isLoading || isScrapingActive}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Play size={20} color="white" />
          )}
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Starting...' : 'Start Full Scraping'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.sourceButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => handleStartScraping(['bayut'])}
            disabled={isLoading || status?.currentSources?.bayut}
          >
            <Text style={styles.secondaryButtonText}>Scrape Bayut</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => handleStartScraping(['aqar'])}
            disabled={isLoading || status?.currentSources?.aqar}
          >
            <Text style={styles.secondaryButtonText}>Scrape Aqar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => handleStartScraping(['wasalt'])}
            disabled={isLoading || status?.currentSources?.wasalt}
          >
            <Text style={styles.secondaryButtonText}>Scrape Wasalt</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      {status.history && status.history.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {status.history.map((entry: any, index: number) => (
            <View key={entry.id || index} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>
                  {entry.sources?.join(', ') || 'All Sources'}
                </Text>
                <Text style={styles.historyTime}>
                  {entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : 'Unknown time'}
                </Text>
              </View>
              <Text style={styles.historyDetails}>
                {entry.totalProperties || 0} properties • {entry.totalErrors || 0} errors
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  ), [isScrapingActive, status, isLoading, handleStartScraping]);
  
  const renderDataTab = React.useCallback(() => (
    <>
      {/* Data Management */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Management</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.successButton]}
          onPress={handleGenerateSample}
          disabled={isLoading}
        >
          <Plus size={20} color="white" />
          <Text style={styles.successButtonText}>Generate Sample Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={() => setShowImportModal(true)}
          disabled={isLoading}
        >
          <Upload size={20} color="white" />
          <Text style={styles.infoButtonText}>Import JSON Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={handleExportData}
          disabled={isLoading}
        >
          <Download size={20} color="white" />
          <Text style={styles.infoButtonText}>Export Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleClearCache}
          disabled={isLoading}
        >
          <Trash2 size={20} color="white" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
      
      {/* Data Quality */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Quality</Text>
        <View style={styles.qualityStats}>
          <View style={styles.qualityItem}>
            <Text style={styles.qualityValue}>{dataInfo.dataQuality?.withImages || 0}</Text>
            <Text style={styles.qualityLabel}>With Images</Text>
          </View>
          <View style={styles.qualityItem}>
            <Text style={styles.qualityValue}>{dataInfo.dataQuality?.withDescription || 0}</Text>
            <Text style={styles.qualityLabel}>With Description</Text>
          </View>
          <View style={styles.qualityItem}>
            <Text style={styles.qualityValue}>{dataInfo.dataQuality?.withAgent || 0}</Text>
            <Text style={styles.qualityLabel}>With Agent</Text>
          </View>
          <View style={styles.qualityItem}>
            <Text style={styles.qualityValue}>{dataInfo.dataQuality?.complete || 0}</Text>
            <Text style={styles.qualityLabel}>Complete</Text>
          </View>
        </View>
      </View>
    </>
  ), [dataInfo, isLoading, handleGenerateSample, handleExportData, handleClearCache]);
  
  const renderAlternativesTab = React.useCallback(() => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Alternative Data Collection Methods</Text>
      
      {alternatives.currentLimitations && alternatives.currentLimitations.length > 0 && (
        <View style={styles.limitationsSection}>
          <Text style={styles.sectionTitle}>Current Limitations:</Text>
          {alternatives.currentLimitations.map((limitation: string, index: number) => (
            <Text key={index} style={styles.limitationText}>• {limitation}</Text>
          ))}
        </View>
      )}
      
      {alternatives.recommendations && alternatives.recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommendations:</Text>
          {alternatives.recommendations.map((recommendation: string, index: number) => (
            <Text key={index} style={styles.recommendationText}>• {recommendation}</Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.actionButton, styles.infoButton]}
        onPress={() => setShowAlternativesModal(true)}
      >
        <Info size={20} color="white" />
        <Text style={styles.infoButtonText}>View Detailed Solutions</Text>
      </TouchableOpacity>
    </View>
  ), [alternatives]);
  
  const renderAnalyticsTab = React.useCallback(() => (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Source Distribution</Text>
        <View style={styles.sourceStats}>
          {Object.entries(dataInfo.sourceStats || {}).map(([source, count]) => (
            <View key={source} style={styles.sourceStatItem}>
              <Text style={styles.sourceStatLabel}>{source.charAt(0).toUpperCase() + source.slice(1)}</Text>
              <Text style={styles.sourceStatValue}>{String(count)}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Price Ranges</Text>
        <View style={styles.priceStats}>
          {Object.entries(dataInfo.priceRanges || {}).map(([range, count]) => (
            <View key={range} style={styles.priceStatItem}>
              <Text style={styles.priceStatLabel}>{range}</Text>
              <Text style={styles.priceStatValue}>{String(count)}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Property Types</Text>
        <View style={styles.typeStats}>
          {Object.entries(dataInfo.typeStats || {}).map(([type, count]) => (
            <View key={type} style={styles.typeStatItem}>
              <Text style={styles.typeStatLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              <Text style={styles.typeStatValue}>{String(count)}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  ), [dataInfo]);

  return (
    <View style={styles.container}>
      <CustomHeader 
        titleEn="Admin"
        titleAr="الإدارة"
        showLogo={true}
      />
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Settings size={16} color={selectedTab === 'overview' ? '#007AFF' : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'data' && styles.activeTab]}
          onPress={() => setSelectedTab('data')}
        >
          <Database size={16} color={selectedTab === 'data' ? '#007AFF' : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'data' && styles.activeTabText]}>Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'alternatives' && styles.activeTab]}
          onPress={() => setSelectedTab('alternatives')}
        >
          <Info size={16} color={selectedTab === 'alternatives' ? '#007AFF' : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'alternatives' && styles.activeTabText]}>Solutions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'analytics' && styles.activeTab]}
          onPress={() => setSelectedTab('analytics')}
        >
          <BarChart3 size={16} color={selectedTab === 'analytics' ? '#007AFF' : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Scraping Admin Panel</Text>
        
        {/* Loading Status */}
        {(statusQuery.isLoading || dataInfoQuery.isLoading || alternativesQuery.isLoading) && (
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.statusText}>Loading scraping data...</Text>
            </View>
            <Text style={styles.loadingSubtext}>
              {statusQuery.isLoading && 'Loading status... '}
              {dataInfoQuery.isLoading && 'Loading data info... '}
              {alternativesQuery.isLoading && 'Loading alternatives... '}
            </Text>
          </View>
        )}
        
        {/* Connection Status */}
        {(statusQuery.isError || dataInfoQuery.isError || alternativesQuery.isError) && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Demo Mode Active</Text>
            <Text style={styles.warningMessage}>
              Backend connection unavailable. Using mock data for demonstration.
              {statusQuery.isError && ' Status service offline.'}
              {dataInfoQuery.isError && ' Data service offline.'}
              {alternativesQuery.isError && ' Alternatives service offline.'}
            </Text>
            <Text style={styles.warningSubtext}>
              All scraping operations will use sample data. This is normal for demo purposes.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.infoButton]}
              onPress={() => {
                console.log('Retrying connections...');
                statusQuery.refetch();
                dataInfoQuery.refetch();
                alternativesQuery.refetch();
              }}
            >
              <RefreshCw size={16} color="white" />
              <Text style={styles.infoButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'data' && renderDataTab()}
        {selectedTab === 'alternatives' && renderAlternativesTab()}
        {selectedTab === 'analytics' && renderAnalyticsTab()}
      </ScrollView>
      
      {/* Import Modal */}
      <Modal visible={showImportModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Import JSON Data</Text>
            <TouchableOpacity onPress={() => setShowImportModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalDescription}>
            Paste your JSON data below. Expected format: array of property objects.
          </Text>
          
          <TextInput
            style={styles.jsonInput}
            multiline
            placeholder="Paste JSON data here..."
            value={importData}
            onChangeText={setImportData}
          />
          
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleImportData}
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Upload size={20} color="white" />
            )}
            <Text style={styles.primaryButtonText}>Import Data</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      
      {/* Export Modal */}
      <Modal visible={showExportModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Data</Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.exportDataContainer}>
            <Text style={styles.exportData}>{exportQuery.data?.data || 'No data available'}</Text>
          </ScrollView>
        </View>
      </Modal>
      
      {/* Alternatives Modal */}
      <Modal visible={showAlternativesModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Data Collection Solutions</Text>
            <TouchableOpacity onPress={() => setShowAlternativesModal(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.alternativesContent}>
            {alternatives.alternatives && (
              <>
                {alternatives.alternatives.apis && alternatives.alternatives.apis.length > 0 && (
                  <>
                    <Text style={styles.alternativesSectionTitle}>API Solutions:</Text>
                    {alternatives.alternatives.apis.map((api: any, index: number) => (
                      <View key={index} style={styles.alternativeItem}>
                        <Text style={styles.alternativeTitle}>{api.name}</Text>
                        <Text style={styles.alternativeDescription}>{api.description}</Text>
                        <Text style={styles.alternativeStatus}>Status: {api.status}</Text>
                      </View>
                    ))}
                  </>
                )}
                
                {alternatives.alternatives.tools && alternatives.alternatives.tools.length > 0 && (
                  <>
                    <Text style={styles.alternativesSectionTitle}>Tools & Services:</Text>
                    {alternatives.alternatives.tools.map((tool: any, index: number) => (
                      <View key={index} style={styles.alternativeItem}>
                        <Text style={styles.alternativeTitle}>{tool.name}</Text>
                        <Text style={styles.alternativeDescription}>{tool.description}</Text>
                        <Text style={styles.alternativeExamples}>Examples: {tool.examples?.join(', ') || 'N/A'}</Text>
                      </View>
                    ))}
                  </>
                )}
                
                {alternatives.alternatives.manual && alternatives.alternatives.manual.length > 0 && (
                  <>
                    <Text style={styles.alternativesSectionTitle}>Manual Methods:</Text>
                    {alternatives.alternatives.manual.map((method: any, index: number) => (
                      <View key={index} style={styles.alternativeItem}>
                        <Text style={styles.alternativeTitle}>{method.name}</Text>
                        <Text style={styles.alternativeDescription}>{method.description}</Text>
                        <Text style={styles.alternativeFormat}>Format: {method.format}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sourceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  historyTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  qualityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qualityItem: {
    alignItems: 'center',
    gap: 4,
  },
  qualityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  qualityLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  limitationsSection: {
    marginBottom: 16,
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  limitationText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 4,
    lineHeight: 20,
  },
  recommendationText: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 4,
    lineHeight: 20,
  },
  sourceStats: {
    gap: 8,
  },
  sourceStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  sourceStatLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  sourceStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  priceStats: {
    gap: 8,
  },
  priceStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
  },
  priceStatLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
  },
  priceStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
  typeStats: {
    gap: 8,
  },
  typeStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
  },
  typeStatLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF',
  },
  typeStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    margin: 16,
    lineHeight: 20,
  },
  jsonInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 14,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  exportDataContainer: {
    flex: 1,
    margin: 16,
  },
  exportData: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
    lineHeight: 16,
  },
  alternativesContent: {
    flex: 1,
    padding: 16,
  },
  alternativesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  alternativeItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  alternativeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  alternativeStatus: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  alternativeExamples: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  alternativeFormat: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 12,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  warningMessage: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 8,
    lineHeight: 20,
  },
  warningSubtext: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
});