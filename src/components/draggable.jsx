
import React, { useState } from 'react';
import {
    DndContext,
    useDraggable,
    useDroppable,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function MovingFrame() {
    const [isDropped, setIsDropped] = useState(false);

    // ✅ Configure sensors for both mouse and touch
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor)
    );


    useSensor(TouchSensor, {
        activationConstraint: {
            distance: 8, // drag starts after moving 8px
        },
    });


    const draggableMarkup = <DraggableTest>Drag me</DraggableTest>;

    function handleDragEnd(event) {
        if (event.over && event.over.id === 'droppable') {
            setIsDropped(true);
        }
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {!isDropped ? draggableMarkup : null}
            <DroppableTest>
                {isDropped ? draggableMarkup : 'Drop here'}
            </DroppableTest>
        </DndContext>
    );
}

function DroppableTest(props) {
    const { isOver, setNodeRef } = useDroppable({
        id: 'droppable',
    });

    const style = {
        color: isOver ? 'green' : undefined,
        position: 'absolute',
        left: '3rem',
        border: '1px dashed gray',
        padding: '1rem'
    };

    return (
        <div ref={setNodeRef} style={style}>
            {props.children}
        </div>
    );
}

function DraggableTest(props) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'draggable',
    });

    const style = transform
        ? {
            transform: CSS.Translate.toString(transform),
        }
        : undefined;

    return (
        <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {props.children}
        </button>
    );
}
