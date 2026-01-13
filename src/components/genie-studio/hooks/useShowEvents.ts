/**
 * useShowEvents Hook - Extracted from GenieStudio.tsx
 * Custom hook for managing shows/events
 */

import { useState, useEffect } from 'react';
import type { ShowEvent, Participant } from '../types/studio-types';

export function useShowEvents() {
  const [events, setEvents] = useState<ShowEvent[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('genieStudioEvents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEvents(parsed.map((e: any) => ({
          ...e,
          scheduledDate: new Date(e.scheduledDate)
        })));
      } catch (e) {
        console.error('Failed to load events:', e);
      }
    }
  }, []);

  const saveEvents = (newEvents: ShowEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('genieStudioEvents', JSON.stringify(newEvents));
  };

  const addEvent = (event: Omit<ShowEvent, 'id'>) => {
    const newEvent: ShowEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    saveEvents([...events, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<ShowEvent>) => {
    const updated = events.map(e => e.id === id ? { ...e, ...updates } : e);
    saveEvents(updated);
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
  };

  const addParticipant = (eventId: string, participant: Omit<Participant, 'id'>) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const newParticipant: Participant = {
        ...participant,
        id: crypto.randomUUID()
      };
      updateEvent(eventId, {
        participants: [...event.participants, newParticipant]
      });
      return newParticipant;
    }
    return null;
  };

  const upcomingEvents = events
    .filter(e => e.scheduledDate > new Date() && e.status === 'scheduled')
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

  return { events, upcomingEvents, addEvent, updateEvent, deleteEvent, addParticipant };
}
