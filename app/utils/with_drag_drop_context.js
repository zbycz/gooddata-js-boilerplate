import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import TestBackend from 'react-dnd-test-backend';


export default function withDragDrop(WrappedComponent) {
    return DragDropContext(TestBackend)(
        class extends Component {
            render() {
                return <WrappedComponent {...this.props} />;
            }
        }
    );
}
