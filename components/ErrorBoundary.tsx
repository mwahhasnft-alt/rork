import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
  testID?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, errorMessage: error instanceof Error ? error.message : 'Unknown error' };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled UI error:', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID={this.props.testID ?? 'error-boundary'}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.errorMessage ?? 'Unknown error'}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry} testID="retry-button">
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children as React.ReactNode;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0B0B0F',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EDEFF3',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#B5BAC1',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
