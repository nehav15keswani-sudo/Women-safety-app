/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar, AppTab } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { SosBeacon } from './components/SosBeacon';
import { WalkWithMe } from './components/WalkWithMe';
import { FakeCallModal } from './components/FakeCallModal';
import { CalculatorCloak } from './components/CalculatorCloak';
import { AudioEvidenceRecorder } from './components/AudioEvidenceRecorder';
import { HelplineDirectory } from './components/HelplineDirectory';
import { EmergencyContacts } from './components/EmergencyContacts';
import { SafetyGuides } from './components/SafetyGuides';
import { SimplifiedLegalRights } from './components/SimplifiedLegalRights';
import { DefenseVideos } from './components/DefenseVideos';
import { VideoEvidenceRecorder } from './components/VideoEvidenceRecorder';
import { OfflineMapNavigator } from './components/OfflineMapNavigator';
import { AutoSosWarningModal } from './components/AutoSosWarningModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { QuickSosWidget } from './components/QuickSosWidget';
import { EmergencyContact, AudioRecording, LocationCoordinates } from './types';
import { DEFAULT_CONTACTS } from './data/safetyData';
import { getCurrentLocation } from './utils/location';
import { startEmergencySiren, stopEmergencySiren, isSirenPlaying } from './utils/audioAlert';
import { SupportedLanguage } from './i18n/translations';
import {
  MotionDetector,
  MotionDetectorConfig,
  MotionTelemetry,
  MotionTriggerReason
} from './utils/motionDetector';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('sos');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('aegis_language') as SupportedLanguage) || 'en';
  });

  const [isCloaked, setIsCloaked] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);

  // Auto-SOS Accelerometer state
  const [autoSosConfig, setAutoSosConfig] = useState<MotionDetectorConfig>(() => {
    const saved = localStorage.getItem('aegis_autosos_config');
    return saved
      ? JSON.parse(saved)
      : {
          sensitivity: 'medium',
          detectFall: true,
          detectShake: true,
        };
  });

  const [isAutoSosEnabled, setIsAutoSosEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('aegis_autosos_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [telemetry, setTelemetry] = useState<MotionTelemetry | null>(null);
  const [autoSosWarning, setAutoSosWarning] = useState<{
    isOpen: boolean;
    reason: MotionTriggerReason | null;
    magnitude: number;
  }>({
    isOpen: false,
    reason: null,
    magnitude: 0,
  });

  const [externalActiveSos, setExternalActiveSos] = useState(false);
  const [sosCustomNote, setSosCustomNote] = useState('');

  // User profile
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('aegis_user_name') || 'Neha';
  });

  // Emergency contacts state with localStorage persistence
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('aegis_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  // Evidence recordings state
  const [recordings, setRecordings] = useState<AudioRecording[]>(() => {
    const saved = localStorage.getItem('aegis_recordings');
    return saved ? JSON.parse(saved) : [];
  });

  // Motion detector reference
  const detectorRef = useRef<MotionDetector | null>(null);

  useEffect(() => {
    localStorage.setItem('aegis_language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('aegis_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('aegis_recordings', JSON.stringify(recordings));
  }, [recordings]);

  useEffect(() => {
    localStorage.setItem('aegis_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('aegis_autosos_config', JSON.stringify(autoSosConfig));
    if (detectorRef.current) {
      detectorRef.current.updateConfig(autoSosConfig);
    }
  }, [autoSosConfig]);

  useEffect(() => {
    localStorage.setItem('aegis_autosos_enabled', String(isAutoSosEnabled));
    if (detectorRef.current) {
      if (isAutoSosEnabled) {
        detectorRef.current.start();
      } else {
        detectorRef.current.stop();
      }
    }
  }, [isAutoSosEnabled]);

  // Initial passive geolocation lock
  useEffect(() => {
    getCurrentLocation()
      .then((coords) => setUserLocation(coords))
      .catch((e) => console.log('Location warm-up:', e.message));
  }, []);

  // Motion Detector Initialization
  const handleMotionTrigger = useCallback((reason: MotionTriggerReason, magnitude: number) => {
    setAutoSosWarning({
      isOpen: true,
      reason,
      magnitude,
    });
  }, []);

  const handleTelemetryUpdate = useCallback((t: MotionTelemetry) => {
    setTelemetry(t);
  }, []);

  useEffect(() => {
    const detector = new MotionDetector(
      autoSosConfig,
      handleMotionTrigger,
      handleTelemetryUpdate
    );
    detectorRef.current = detector;

    if (isAutoSosEnabled) {
      detector.start();
    }

    return () => {
      detector.stop();
      detectorRef.current = null;
    };
  }, []);

  const handleConfirmAutoSos = (reason: MotionTriggerReason) => {
    setAutoSosWarning({ isOpen: false, reason: null, magnitude: 0 });
    setActiveTab('sos');
    setExternalActiveSos(true);

    const note =
      reason === 'fall'
        ? `[AUTO-SOS DETECTED]: Severe sudden fall / ground impact detected by device accelerometer.`
        : `[AUTO-SOS DETECTED]: Violent rapid distress shaking detected by device accelerometer.`;
    setSosCustomNote(note);

    startEmergencySiren();
    setIsSirenActive(true);

    getCurrentLocation()
      .then((c) => setUserLocation(c))
      .catch((err) => console.warn('GPS refresh on Auto-SOS:', err));
  };

  const handleCancelAutoSos = () => {
    setAutoSosWarning({ isOpen: false, reason: null, magnitude: 0 });
  };

  const handleSimulateFall = () => {
    if (detectorRef.current) {
      detectorRef.current.simulateFall();
    } else {
      handleMotionTrigger('fall', 28.5);
    }
  };

  const handleSimulateShake = () => {
    if (detectorRef.current) {
      detectorRef.current.simulateViolentShake();
    } else {
      handleMotionTrigger('violent_shake', 27.2);
    }
  };

  const handleResetPeak = () => {
    if (detectorRef.current) {
      detectorRef.current.resetPeak();
    }
  };

  const handleRequestMotionPermission = async () => {
    if (detectorRef.current) {
      return await detectorRef.current.requestPermissions();
    }
    return true;
  };

  const handleToggleSiren = () => {
    if (isSirenPlaying()) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      startEmergencySiren();
      setIsSirenActive(true);
    }
  };

  const handleAddContact = (contact: EmergencyContact) => {
    if (contact.isPrimary) {
      setContacts((prev) => [
        ...prev.map((c) => ({ ...c, isPrimary: false })),
        contact,
      ]);
    } else {
      setContacts((prev) => [...prev, contact]);
    }
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSetPrimaryContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  const handleSaveRecording = (rec: AudioRecording) => {
    setRecordings((prev) => [rec, ...prev]);
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSecretSosFromCloak = () => {
    setIsCloaked(false);
    setActiveTab('sos');
    setExternalActiveSos(true);
    setSosCustomNote('[DISCREET CODE]: Emergency triggered via disguised PIN');
    startEmergencySiren();
    setIsSirenActive(true);
  };

  if (isCloaked) {
    return (
      <CalculatorCloak
        onExit={() => setIsCloaked(false)}
        onSecretSos={handleSecretSosFromCloak}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-rose-500 selection:text-white">
      {/* Top Bar Navigation with Language Selector */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEnterCloak={() => setIsCloaked(true)}
        isSirenActive={isSirenActive}
        onToggleSiren={handleToggleSiren}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {activeTab === 'sos' && (
          <SosBeacon
            contacts={contacts}
            userName={userName}
            onStartAudioRecording={() => setIsAudioRecording((prev) => !prev)}
            isAudioRecording={isAudioRecording}
            onOpenFakeCall={() => setIsFakeCallOpen(true)}
            autoSosConfig={autoSosConfig}
            onUpdateAutoSosConfig={(cfg) => setAutoSosConfig((prev) => ({ ...prev, ...cfg }))}
            isAutoSosEnabled={isAutoSosEnabled}
            onToggleAutoSosEnabled={setIsAutoSosEnabled}
            telemetry={telemetry}
            onSimulateFall={handleSimulateFall}
            onSimulateShake={handleSimulateShake}
            onResetPeak={handleResetPeak}
            onRequestPermission={handleRequestMotionPermission}
            externalActiveSos={externalActiveSos}
            initialCustomNote={sosCustomNote}
          />
        )}

        {/* Emergency Offline Map Navigation using Geolocation API & IndexedDB */}
        {activeTab === 'map' && (
          <OfflineMapNavigator
            contacts={contacts}
            userName={userName}
          />
        )}

        {/* Simplified Legal Rights for Uneducated / Common Women with Voice Readout */}
        {activeTab === 'rights' && (
          <SimplifiedLegalRights
            currentLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
          />
        )}

        {/* Tactical Self-Defense Videos */}
        {activeTab === 'defense' && <DefenseVideos currentLanguage={currentLanguage} />}

        {/* Live Camera Incident Video Evidence Recorder & WhatsApp/Multi-App Share */}
        {activeTab === 'video' && (
          <VideoEvidenceRecorder
            userName={userName}
            userLocation={userLocation}
          />
        )}

        {activeTab === 'walk' && (
          <WalkWithMe contacts={contacts} userName={userName} />
        )}

        {activeTab === 'fakecall' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                De-escalation &amp; Exit Tool
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Simulated Incoming Call
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-6">
                Trigger a realistic smartphone incoming call with real phone ring audio and authentic voice dialogue. Perfect for excusing yourself from cabs, uncomfortable social situations, or persistent strangers.
              </p>
              <button
                onClick={() => setIsFakeCallOpen(true)}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-colors"
              >
                Launch Fake Call Setup
              </button>
            </div>
            <AudioEvidenceRecorder
              recordings={recordings}
              onSaveRecording={handleSaveRecording}
              onDeleteRecording={handleDeleteRecording}
              isExternalRecording={isAudioRecording}
              onToggleExternalRecording={() => setIsAudioRecording((prev) => !prev)}
            />
          </div>
        )}

        {activeTab === 'helplines' && (
          <HelplineDirectory userLocation={userLocation} />
        )}

        {activeTab === 'contacts' && (
          <EmergencyContacts
            contacts={contacts}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onSetPrimary={handleSetPrimaryContact}
            userName={userName}
            onUpdateUserName={setUserName}
          />
        )}

        {activeTab === 'guides' && <SafetyGuides />}
      </main>

      {/* Auto-SOS Sudden Fall & Violent Shake Warning Countdown Modal */}
      <AutoSosWarningModal
        isOpen={autoSosWarning.isOpen}
        reason={autoSosWarning.reason}
        magnitude={autoSosWarning.magnitude}
        onConfirmSos={handleConfirmAutoSos}
        onCancel={handleCancelAutoSos}
      />

      {/* Floating or Modal Fake Call */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
      />

      {/* Ambient Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Persistent Home-Screen-Like Quick-Access Widget for Offline SOS */}
      <QuickSosWidget
        contacts={contacts}
        userName={userName}
        userLocation={userLocation}
        onEnterCloak={() => setIsCloaked(true)}
        onTriggerSosMain={() => {
          setActiveTab('sos');
          setExternalActiveSos(true);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
