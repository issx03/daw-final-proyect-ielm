import React from 'react';
import PropTypes from 'prop-types';

class DnDErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DnD Error Captured:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Drag & Drop Error</h2>
          <p className="text-slate-600 mb-4">The drag-and-drop engine encountered an unexpected state.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Reset Board
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

DnDErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DnDErrorBoundary;
