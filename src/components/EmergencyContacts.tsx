import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Trash2,
  CheckCircle2,
  Star,
  MessageSquare,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { EmergencyContact } from '../types';
import { dispatchWhatsApp, dispatchSms } from '../utils/location';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
  onSetPrimary: (id: string) => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onSetPrimary,
  userName,
  onUpdateUserName,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [relationshipInput, setRelationshipInput] = useState('Family');
  const [isPrimaryInput, setIsPrimaryInput] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setFormError('Please provide a name.');
      return;
    }
    if (!phoneInput.trim() || phoneInput.length < 5) {
      setFormError('Please enter a valid phone number with country code.');
      return;
    }

    const newContact: EmergencyContact = {
      id: 'contact_' + Date.now(),
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      relationship: relationshipInput,
      isPrimary: isPrimaryInput || contacts.length === 0,
      notifyOnSos: true,
    };

    onAddContact(newContact);
    setNameInput('');
    setPhoneInput('');
    setRelationshipInput('Family');
    setIsPrimaryInput(false);
    setFormError('');
    setShowAddForm(false);
  };

  const handleSendTestVerification = (contact: EmergencyContact) => {
    const text = `👋 Hello ${contact.name}! ${userName} has set you as their emergency contact on Aegis SafeGuard. In case of an emergency, you will receive live GPS coordinates and distress alerts from this number.`;
    dispatchWhatsApp(contact.phone, text);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Trusted Circle
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Emergency Contacts &amp; Guardians
          </h2>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guardian</span>
        </button>
      </div>

      {/* User profile identifier */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Your Beacon Name / Identity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            This name appears in your emergency SMS &amp; WhatsApp broadcasts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userName}
            onChange={(e) => onUpdateUserName(e.target.value)}
            placeholder="Your Name (e.g. Neha)"
            className="px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium"
          />
        </div>
      </div>

      {/* Add Guardian Modal / Box */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/30 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Emergency Contact
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl">
              {formError}
            </p>
          )}

          <form onSubmit={handleCreateContact} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Guardian Full Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Mom, Maya, Officer Dave"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (with Country Code)
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+1 555-019-2834 or +91 9876543210"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Relationship
              </label>
              <select
                value={relationshipInput}
                onChange={(e) => setRelationshipInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Spouse / Partner">Spouse / Partner</option>
                <option value="Friend / Roommate">Friend / Roommate</option>
                <option value="Colleague">Colleague</option>
                <option value="Neighbor">Neighbor</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isPrimaryCheckbox"
                checked={isPrimaryInput}
                onChange={(e) => setIsPrimaryInput(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
              <label htmlFor="isPrimaryCheckbox" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Set as Primary Guardian (first to be dialed)
              </label>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Save Emergency Guardian
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all ${
              contact.isPrimary
                ? 'border-rose-400 dark:border-rose-800 ring-2 ring-rose-500/10'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {contact.name}
                    {contact.isPrimary && (
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-semibold">
                        Primary
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">{contact.relationship}</p>
                </div>
                <button
                  onClick={() => onDeleteContact(contact.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 mb-4">
                {contact.phone}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <button
                  onClick={() => handleSendTestVerification(contact)}
                  className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                  title="Send confirmation ping via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Test Ping</span>
                </button>
              </div>

              {!contact.isPrimary && (
                <button
                  onClick={() => onSetPrimary(contact.id)}
                  className="w-full py-1.5 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium hover:underline text-center"
                >
                  Make Primary Guardian
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
