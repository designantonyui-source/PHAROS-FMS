/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MoreVertical, 
  AlertCircle, 
  Users, 
  Building2, 
  BarChart3, 
  Leaf, 
  CreditCard, 
  Settings, 
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Package,
  Ship,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Warehouse,
  X,
  User,
  Mail,
  FileText,
  MapPin,
  Navigation,
  Activity,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FreightLifecycleEngine from './components/FreightLifecycleEngine';

// --- Types ---

type LoadStatus = 'Tendered' | 'Booked' | 'In Transit' | 'Delivered' | 'Invoiced';

interface Load {
  id: string;
  alert: boolean;
  origin: string;
  destination: string;
  date: string;
  customer: string;
  carrier: string;
  status: LoadStatus;
  weight: string;
  volume: string;
  vehicleType: string;
  notes?: string;
}

// --- Components ---

const KPICard = ({ title, value, subtext, trend }: { title: string, value: string, subtext: string, trend: string }) => (
  <div 
    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }}
    className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 group"
  >
    <div className="flex justify-between items-start mb-4">
      <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-widest">{title}</p>
      <div 
        style={{ 
          backgroundColor: trend.startsWith('+') ? 'var(--color-success)' : trend === '0%' ? 'var(--muted)' : 'var(--color-error)',
          color: trend.startsWith('+') ? 'var(--color-success-foreground)' : trend === '0%' ? 'var(--muted-foreground)' : 'var(--color-error-foreground)'
        }}
        className="px-2 py-1 rounded-lg text-sm font-medium font-sans"
      >
        {trend}
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <h3 style={{ color: 'var(--foreground)' }} className="text-4xl font-bold font-sans tracking-tight">{value}</h3>
    </div>
    <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans mt-2">{subtext}</p>
  </div>
);

const StatusBadge = ({ status }: { status: LoadStatus }) => {
  const styles = {
    'Tendered': { bg: 'var(--color-info)', text: 'var(--color-info-foreground)', border: 'var(--color-info-foreground)', dot: 'var(--color-info-foreground)' },
    'Booked': { bg: 'var(--accent)', text: 'var(--accent-foreground)', border: 'var(--border)', dot: 'var(--accent-foreground)' },
    'In Transit': { bg: 'var(--color-warning)', text: 'var(--color-warning-foreground)', border: 'var(--color-warning-foreground)', dot: 'var(--color-warning-foreground)' },
    'Delivered': { bg: 'var(--color-success)', text: 'var(--color-success-foreground)', border: 'var(--color-success-foreground)', dot: 'var(--color-success-foreground)' },
    'Invoiced': { bg: 'var(--muted)', text: 'var(--muted-foreground)', border: 'var(--border)', dot: 'var(--muted-foreground)' }
  };

  const currentStyle = styles[status];

  return (
    <span 
      style={{ backgroundColor: currentStyle.bg, color: currentStyle.text, borderColor: currentStyle.border + '20' }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans uppercase tracking-wider border"
    >
      <span 
        style={{ backgroundColor: currentStyle.dot }}
        className="w-1 h-1 rounded-full mr-1.5" 
      />
      {status}
    </span>
  );
};

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    style={{ 
      backgroundColor: active ? 'var(--sidebar-accent)' : 'transparent',
      color: active ? 'var(--sidebar-accent-foreground)' : 'var(--sidebar-foreground)'
    }}
    className="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
  >
    <Icon 
      size={18} 
      style={{ color: active ? 'var(--primary)' : 'var(--sidebar-foreground)' }}
      className="transition-colors" 
    />
    <span className="text-sm font-medium font-sans">{label}</span>
    {active && <div style={{ backgroundColor: 'var(--primary)' }} className="ml-auto w-1 h-4 rounded-full" />}
  </div>
);

const SidebarSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <p style={{ color: 'var(--muted-foreground)' }} className="px-3 text-sm font-medium font-sans uppercase tracking-[0.15em] mb-3">{title}</p>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const LoadDetailModal = ({ load, onClose }: { load: Load, onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    className="fixed inset-0 backdrop-blur-sm z-[100] flex justify-end"
    onClick={onClose}
  >
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
      className="h-full w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div 
        style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
        className="p-8 border-b flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <div 
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Package size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-mono uppercase tracking-[0.2em]">{load.id}</span>
              <StatusBadge status={load.status} />
            </div>
            <h3 style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans tracking-tight">Load Details</h3>
          </div>
        </div>
        <button 
          onClick={onClose} 
          style={{ color: 'var(--muted-foreground)', borderColor: 'transparent' }}
          className="p-2.5 hover:bg-background rounded-xl transition-all border shadow-sm hover:shadow-md active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* Route Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
            <h4 style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-[0.2em]">Route Information</h4>
          </div>
          <div className="relative pl-10 space-y-12">
            <div style={{ backgroundColor: 'var(--border)' }} className="absolute left-[13px] top-3 bottom-3 w-0.5 border-l-2 border-dashed" />
            
            <div className="relative">
              <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)' }} className="absolute -left-10 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shadow-sm">
                <div style={{ backgroundColor: 'var(--primary)' }} className="w-2.5 h-2.5 rounded-full animate-pulse" />
              </div>
              <div>
                <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-widest mb-1">Pickup</p>
                <p style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans tracking-tight">{load.origin}</p>
                <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans mt-1">Scheduled: {load.date} • 08:00 AM</p>
              </div>
            </div>

            <div className="relative">
              <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="absolute -left-10 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shadow-sm">
                <div style={{ backgroundColor: 'var(--border)' }} className="w-2.5 h-2.5 rounded-full" />
              </div>
              <div>
                <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-widest mb-1">Destination</p>
                <p style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans tracking-tight">{load.destination}</p>
                <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans mt-1">Estimated: {load.date} • 04:30 PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <div className="grid grid-cols-1 gap-6">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
              <h4 style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-[0.2em]">Stakeholders</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="flex items-center gap-3 p-4 rounded-2xl border group hover:bg-card hover:shadow-md transition-all duration-300">
                <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm group-hover:border-primary/30 transition-colors">
                  <Building2 size={22} style={{ color: 'var(--muted-foreground)' }} className="group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-widest mb-0.5">Customer</p>
                  <p style={{ color: 'var(--foreground)' }} className="text-sm font-medium font-sans">{load.customer}</p>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--primary)' }} className="flex items-center gap-3 p-4 rounded-2xl border group hover:bg-card hover:shadow-md transition-all duration-300">
                <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)' }} className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm group-hover:border-primary/30 transition-colors">
                  <Truck size={22} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p style={{ color: 'var(--primary)' }} className="text-sm font-medium font-sans uppercase tracking-widest mb-0.5">Carrier</p>
                  <p style={{ color: 'var(--foreground)' }} className="text-sm font-medium font-sans">{load.carrier}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Specs Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
            <h4 style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-[0.2em]">Cargo Specifications</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border hover:bg-card hover:shadow-sm transition-all">
              <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest mb-2">Equipment</p>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: 'var(--primary)' }} className="w-2 h-2 rounded-full" />
                <p style={{ color: 'var(--foreground)' }} className="text-sm font-bold tracking-tight">{load.vehicleType}</p>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border hover:bg-card hover:shadow-sm transition-all">
              <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest mb-2">Weight</p>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: 'var(--primary)' }} className="w-2 h-2 rounded-full" />
                <p style={{ color: 'var(--foreground)' }} className="text-sm font-bold tracking-tight">{load.weight}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notes */}
        {load.notes && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
              <h4 style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-[0.2em]">Internal Notes</h4>
            </div>
            <div style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border relative overflow-hidden group">
              <div style={{ backgroundColor: 'var(--primary)' }} className="absolute top-0 left-0 w-1 h-full opacity-20" />
              <p style={{ color: 'var(--foreground)' }} className="text-sm font-normal font-sans italic leading-relaxed relative z-10">"{load.notes}"</p>
            </div>
          </section>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{ borderTopColor: 'var(--border)', backgroundColor: 'var(--card)' }} className="p-8 border-t flex gap-4">
        <button style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} className="flex-1 border hover:bg-muted py-4 rounded-xl font-medium font-sans text-sm transition-all active:scale-95 shadow-sm hover:shadow-md">
          Edit Load
        </button>
        <button style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }} className="flex-1 py-4 rounded-xl font-medium font-sans text-sm transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2">
          <MapPin size={18} />
          Track Shipment
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const NetworkDetailDrawer = ({ profile, type, onClose }: { profile: any, type: 'carriers' | 'shippers' | 'facilities', onClose: () => void }) => {
  if (!profile) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'bg-success';
      case 'Missing Insurance': return 'bg-destructive';
      case 'DNU/Blacklisted': return 'bg-muted-foreground';
      default: return 'bg-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex justify-end"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
        className="relative w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="p-8 border-b flex justify-between items-center sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium font-sans uppercase tracking-wider ${
                type === 'carriers' ? 'bg-info text-info-foreground border border-info-foreground/20' :
                type === 'shippers' ? 'bg-accent text-accent-foreground border border-border' : 'bg-success text-success-foreground border border-success-foreground/20'
              }`}>
                {type.slice(0, -1)} Profile
              </span>
              <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-mono uppercase tracking-widest">{profile.id}</span>
            </div>
            <h2 style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans tracking-tight">{profile.name}</h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
            className="p-2.5 hover:bg-background rounded-xl transition-all border shadow-sm hover:shadow-md active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-32 custom-scrollbar">
          {/* Status Section */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
              <h3 style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-[0.2em] flex items-center gap-2">
                Operational Status
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border hover:bg-card hover:shadow-sm transition-all">
                <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-widest mb-2">Current Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(profile.status)} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                  <span className={`text-sm font-medium font-sans ${
                    profile.status === 'Compliant' ? 'text-success' : 
                    profile.status === 'DNU/Blacklisted' ? 'text-muted-foreground' : 'text-destructive'
                  }`}>
                    {profile.status}
                  </span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border hover:bg-card hover:shadow-sm transition-all">
                <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-widest mb-2">Last Verified</p>
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <p style={{ color: 'var(--foreground)' }} className="text-sm font-medium font-sans tracking-tight">2 days ago</p>
                </div>
              </div>
            </div>
          </section>

          {/* Type Specific Details */}
          {type === 'carriers' && (
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
                <h3 style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-[0.2em]">Fleet & Equipment</h3>
              </div>
              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="rounded-2xl border overflow-hidden divide-y divide-border">
                <div className="flex justify-between items-center p-4 hover:bg-card transition-colors">
                  <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-sans">Equipment Type</span>
                  <span style={{ color: 'var(--foreground)' }} className="text-sm font-medium font-sans">{profile.equipment}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-card transition-colors">
                  <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-sans">Performance Rating</span>
                  <span style={{ color: 'var(--primary)' }} className="text-sm font-medium font-sans">{profile.performance}</span>
                </div>
              </div>
            </section>
          )}

          {type === 'shippers' && (
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
                <h3 style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-[0.2em]">Shipping Profile</h3>
              </div>
              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="rounded-2xl border overflow-hidden divide-y divide-border">
                <div className="flex justify-between items-center p-4 hover:bg-card transition-colors">
                  <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-sans">Primary Location</span>
                  <span style={{ color: 'var(--foreground)' }} className="text-sm font-medium font-sans">{profile.location}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-card transition-colors">
                  <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-sans">Monthly Volume</span>
                  <span style={{ color: 'var(--primary)' }} className="text-sm font-medium font-sans">{profile.volume}</span>
                </div>
              </div>
            </section>
          )}

          {type === 'facilities' && (
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
                <h3 style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-[0.2em]">Facility Specs</h3>
              </div>
              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="rounded-2xl border overflow-hidden divide-y divide-border">
                <div className="flex justify-between items-center p-4 hover:bg-card transition-colors">
                  <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-sans">Facility Type</span>
                  <span style={{ color: 'var(--foreground)' }} className="text-sm font-medium font-sans">{profile.type}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-card transition-colors">
                  <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-sans">Storage Capacity</span>
                  <span style={{ color: 'var(--primary)' }} className="text-sm font-medium font-sans">{profile.capacity}</span>
                </div>
              </div>
            </section>
          )}

          {/* Contact Section */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
              <h3 style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-[0.2em]">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="flex items-center gap-4 p-4 rounded-2xl border group hover:bg-card hover:shadow-md transition-all duration-300">
                <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm group-hover:border-primary/50 transition-colors">
                  <User size={20} style={{ color: 'var(--muted-foreground)' }} className="group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest mb-0.5">Contact Person</p>
                  <p style={{ color: 'var(--foreground)' }} className="text-sm font-bold">{profile.contactPerson}</p>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="flex items-center gap-4 p-4 rounded-2xl border group hover:bg-card hover:shadow-md transition-all duration-300">
                <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm group-hover:border-primary/50 transition-colors">
                  <Mail size={20} style={{ color: 'var(--muted-foreground)' }} className="group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest mb-0.5">Email Address</p>
                  <p style={{ color: 'var(--foreground)' }} className="text-sm font-bold">{profile.contactEmail}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-4 rounded-full" />
              <h3 style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-[0.2em]">Internal Intelligence</h3>
            </div>
            <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="p-5 rounded-2xl border relative overflow-hidden">
              <div style={{ backgroundColor: 'var(--border)' }} className="absolute top-0 left-0 w-1 h-full" />
              <p style={{ color: 'var(--muted-foreground)' }} className="text-sm leading-relaxed italic">
                "{profile.notes}"
              </p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }} className="p-8 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.03)] flex gap-4">
          <button style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} className="flex-1 border hover:bg-muted py-4 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95">
            Edit Profile
          </button>
          <button style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }} className="flex-1 py-4 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
            <Mail size={18} />
            Send Message
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NetworkDirectory = () => {
  const [activeTab, setActiveTab] = useState<'carriers' | 'shippers' | 'facilities'>('carriers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const carriers = [
    { id: 'C1', name: 'Swift Logistics', status: 'Compliant', equipment: 'Refrigerated', performance: '98%', contactPerson: 'John Smith', contactEmail: 'john@swiftlogistics.com', notes: 'Reliable partner for temperature-controlled loads.' },
    { id: 'C2', name: 'Global Trans', status: 'Missing Insurance', equipment: 'Dry Van', performance: '85%', contactPerson: 'Sarah Connor', contactEmail: 'sarah@globaltrans.com', notes: 'Pending insurance document update.' },
    { id: 'C3', name: 'Eagle Express', status: 'DNU/Blacklisted', equipment: 'Flatbed', performance: '99%', contactPerson: 'Mike Tyson', contactEmail: 'mike@eagleexpress.com', notes: 'Specializes in oversized equipment.' },
  ];

  const shippers = [
    { id: 'S1', name: 'Amazon Fulfillment', status: 'Compliant', location: 'Berlin, DE', volume: 'High', contactPerson: 'Jeff B.', contactEmail: 'jeff@amazon.com', notes: 'Key account for consumer goods.' },
    { id: 'S2', name: 'Tesla Giga', status: 'Compliant', location: 'Grünheide, DE', volume: 'Medium', contactPerson: 'Elon M.', contactEmail: 'elon@tesla.com', notes: 'Automotive parts shipping.' },
  ];

  const facilities = [
    { id: 'F1', name: 'Hamburg Port Terminal', status: 'Compliant', type: 'Port', capacity: 'Unlimited', contactPerson: 'Hans H.', contactEmail: 'hans@hamburg-port.de', notes: 'Main entry point for sea freight.' },
    { id: 'F2', name: 'Munich Warehouse A', status: 'Compliant', type: 'Warehouse', capacity: '5000 sqm', contactPerson: 'Franz B.', contactEmail: 'franz@munich-wh.de', notes: 'Central distribution hub.' },
  ];

  const tabs = [
    { id: 'carriers', label: 'Carriers', icon: Users },
    { id: 'shippers', label: 'Shippers', icon: Building2 },
    { id: 'facilities', label: 'Facilities', icon: Warehouse },
  ];

  const getActionButtonLabel = () => {
    switch (activeTab) {
      case 'carriers': return '+ Add Carrier';
      case 'shippers': return '+ Add Shipper';
      case 'facilities': return '+ Add Facility';
      default: return '+ Add Partner';
    }
  };

  const handleRowClick = (profile: any) => {
    setSelectedProfile(profile);
    setIsDrawerOpen(true);
  };

  const renderTable = () => {
    const data = activeTab === 'carriers' ? carriers : activeTab === 'shippers' ? shippers : facilities;
    
    return (
      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="border-b">
                <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-sm font-medium font-sans uppercase tracking-widest">
                  {activeTab === 'facilities' ? 'Facility Name' : 'Company Name'}
                </th>
                <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-sm font-medium font-sans uppercase tracking-widest">Status</th>
                <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-sm font-medium font-sans uppercase tracking-widest">
                  {activeTab === 'carriers' ? 'Equipment Type' : activeTab === 'shippers' ? 'Location' : 'Type'}
                </th>
                <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-sm font-medium font-sans uppercase tracking-widest">
                  {activeTab === 'carriers' ? 'Performance' : activeTab === 'shippers' ? 'Volume' : 'Capacity'}
                </th>
                <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-sm font-medium font-sans uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--foreground)' }} className="divide-y divide-border">
              {data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleRowClick(item)}
                  className="hover:bg-muted/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium font-sans">{item.name}</div>
                    <div style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-mono uppercase tracking-tight">{item.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      style={{ 
                        backgroundColor: item.status === 'Compliant' ? 'var(--color-success)' : item.status === 'DNU/Blacklisted' ? 'var(--muted)' : 'var(--color-error)',
                        color: item.status === 'Compliant' ? 'var(--color-success-foreground)' : item.status === 'DNU/Blacklisted' ? 'var(--muted-foreground)' : 'var(--color-error-foreground)',
                        borderColor: 'transparent'
                      }}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans uppercase tracking-wider border"
                    >
                      <span 
                        style={{ backgroundColor: item.status === 'Compliant' ? 'var(--color-success-foreground)' : item.status === 'DNU/Blacklisted' ? 'var(--muted-foreground)' : 'var(--color-error-foreground)' }}
                        className="w-1 h-1 rounded-full mr-1.5" 
                      />
                      {item.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-sm font-medium font-sans">
                    {activeTab === 'carriers' ? item.equipment : activeTab === 'shippers' ? item.location : item.type}
                  </td>
                  <td className="px-6 py-4">
                    {activeTab === 'carriers' ? (
                      <div className="flex items-center gap-3">
                        <div style={{ backgroundColor: 'var(--muted)' }} className="flex-1 max-w-[100px] h-1.5 rounded-full overflow-hidden">
                          <div style={{ backgroundColor: 'var(--primary)', width: item.performance }} className="h-full rounded-full transition-all duration-500" />
                        </div>
                        <span className="text-sm font-medium font-sans">{item.performance}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium font-sans">
                        {activeTab === 'shippers' ? item.volume : item.capacity}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button style={{ color: 'var(--muted-foreground)' }} className="p-2 hover:bg-muted rounded-lg transition-colors hover:text-foreground">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 style={{ color: 'var(--foreground)' }} className="text-4xl font-bold font-sans tracking-tight">Network Directory</h2>
          <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans mt-1">Manage your freight partners, clients, and warehouse locations.</p>
        </div>
        <button style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }} className="px-6 py-3 rounded-full font-bold font-sans text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95">
          {getActionButtonLabel()}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ borderBottomColor: 'var(--border)' }} className="flex border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ 
                borderBottomColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)'
              }}
              className={`flex items-center gap-2 px-8 py-4 text-sm font-bold font-sans transition-all border-b-2 hover:text-foreground`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            className="w-full pl-12 pr-4 py-4 border rounded-2xl text-sm font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
          />
        </div>
        <button style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} className="flex items-center gap-2 px-6 py-4 border rounded-2xl text-sm font-bold font-sans hover:bg-muted transition-all shadow-sm">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Tables */}
      {renderTable()}

      <AnimatePresence>
        {isDrawerOpen && (
          <NetworkDetailDrawer 
            profile={selectedProfile} 
            type={activeTab} 
            onClose={() => setIsDrawerOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const FACILITIES = [
  { id: 'F1', name: 'Alpha Corp Warehouse - Berlin', address: 'Industriestraße 12, 10115 Berlin', hours: '08:00 - 17:00' },
  { id: 'F2', name: 'Gamma Inc - Hamburg', address: 'Hafenstraße 5, 20457 Hamburg', hours: '06:00 - 22:00' },
  { id: 'F3', name: 'Delta Logistics - Munich', address: 'Logistikpark 1, 80331 Munich', hours: '00:00 - 24:00' },
  { id: 'F4', name: 'Beta Distribution - Paris', address: 'Rue de la Logistique 42, 75001 Paris', hours: '09:00 - 18:00' },
];

const CreateLoadDrawer = ({ isOpen, onSave, onClose }: { isOpen: boolean, onSave: (newLoad: Load) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    pickupDateTime: '',
    deliveryLocation: '',
    deliveryDateTime: '',
    equipment: 'Standard Trailer',
    quantityType: '',
    weight: '',
    targetPrice: '',
    palletCount: '',
    isHazardous: false,
    selectedRoute: 'A6',
    loadingMethod: 'Rear (Dock loading)',
    isStackable: false,
    referenceNumber: ''
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [pickupSearch, setPickupSearch] = useState('');
  const [deliverySearch, setDeliverySearch] = useState('');
  const [showPickupResults, setShowPickupResults] = useState(false);
  const [showDeliveryResults, setShowDeliveryResults] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const filteredPickupFacilities = FACILITIES.filter(f => 
    f.name.toLowerCase().includes(pickupSearch.toLowerCase()) || 
    f.address.toLowerCase().includes(pickupSearch.toLowerCase())
  );

  const filteredDeliveryFacilities = FACILITIES.filter(f => 
    f.name.toLowerCase().includes(deliverySearch.toLowerCase()) || 
    f.address.toLowerCase().includes(deliverySearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const val = type === 'checkbox' ? target.checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
    if (!formData.deliveryLocation.trim()) newErrors.deliveryLocation = 'Delivery location is required';
    if (!formData.pickupDateTime) newErrors.pickupDateTime = 'Pickup date/time is required';
    if (!formData.deliveryDateTime) newErrors.deliveryDateTime = 'Delivery date/time is required';

    if (formData.pickupDateTime && formData.deliveryDateTime) {
      const pickup = new Date(formData.pickupDateTime);
      const delivery = new Date(formData.deliveryDateTime);
      if (pickup >= delivery) {
        newErrors.deliveryDateTime = 'Delivery must be after pickup';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newLoad: Load = {
      id: `PH-${Math.floor(100000 + Math.random() * 900000)}`,
      alert: false,
      origin: formData.pickupLocation,
      destination: formData.deliveryLocation,
      date: formData.pickupDateTime.split('T')[0] || new Date().toISOString().split('T')[0],
      customer: 'New Customer',
      carrier: 'Unassigned',
      status: 'Tendered',
      weight: formData.weight,
      volume: formData.quantityType,
      vehicleType: formData.equipment,
      notes: `Ref: ${formData.referenceNumber} | Target Price: €${formData.targetPrice}`
    };
    onSave(newLoad);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
            className="fixed right-0 top-0 h-full w-full max-w-md shadow-2xl z-[101] flex flex-col"
          >
            <div style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }} className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans">Post a New Load</h3>
                <p style={{ color: 'var(--muted-foreground)' }} className="text-xs font-medium font-sans uppercase tracking-widest mt-1">Configure shipment parameters</p>
              </div>
              <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }} className="p-2 hover:bg-background rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <h4 style={{ color: 'var(--muted-foreground)', borderBottomColor: 'var(--border)' }} className="text-xs font-bold font-sans uppercase tracking-[0.2em] border-b pb-2">Route Details</h4>
                <div className="space-y-4">
                  {/* Smart Pickup Location */}
                  <div className="space-y-1.5 relative">
                    <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Pickup Facility</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                      <input 
                        value={pickupSearch}
                        onChange={(e) => {
                          setPickupSearch(e.target.value);
                          setShowPickupResults(true);
                        }}
                        onFocus={() => setShowPickupResults(true)}
                        placeholder="Search facilities..."
                        style={{ backgroundColor: 'var(--muted)', borderColor: errors.pickupLocation ? 'var(--destructive)' : 'var(--border)', color: 'var(--foreground)' }}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                      />
                    </div>
                    {showPickupResults && pickupSearch && (
                      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="absolute z-20 w-full mt-1 border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredPickupFacilities.map(facility => (
                          <div 
                            key={facility.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, pickupLocation: facility.name }));
                              setPickupSearch(facility.name);
                              setShowPickupResults(false);
                            }}
                            className="p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-0"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <p className="text-sm font-bold font-sans">{facility.name}</p>
                            <p style={{ color: 'var(--muted-foreground)' }} className="text-xs font-medium font-sans">{facility.address}</p>
                            <p style={{ color: 'var(--primary)' }} className="text-[10px] font-bold font-sans uppercase mt-1">Dock Hours: {facility.hours}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.pickupLocation && <p style={{ color: 'var(--destructive)' }} className="text-sm font-medium font-sans">{errors.pickupLocation}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Pickup Date/Time</label>
                    <input 
                      type="datetime-local"
                      name="pickupDateTime"
                      value={formData.pickupDateTime}
                      onChange={handleChange}
                      style={{ backgroundColor: 'var(--muted)', borderColor: errors.pickupDateTime ? 'var(--destructive)' : 'var(--border)', color: 'var(--foreground)' }}
                      className={`w-full px-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                    />
                    {errors.pickupDateTime && <p style={{ color: 'var(--destructive)' }} className="text-sm font-medium font-sans">{errors.pickupDateTime}</p>}
                  </div>

                  {/* Smart Delivery Location */}
                  <div className="space-y-1.5 relative">
                    <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Delivery Facility</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                      <input 
                        value={deliverySearch}
                        onChange={(e) => {
                          setDeliverySearch(e.target.value);
                          setShowDeliveryResults(true);
                        }}
                        onFocus={() => setShowDeliveryResults(true)}
                        placeholder="Search facilities..."
                        style={{ backgroundColor: 'var(--muted)', borderColor: errors.deliveryLocation ? 'var(--destructive)' : 'var(--border)', color: 'var(--foreground)' }}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                      />
                    </div>
                    {showDeliveryResults && deliverySearch && (
                      <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="absolute z-20 w-full mt-1 border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredDeliveryFacilities.map(facility => (
                          <div 
                            key={facility.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, deliveryLocation: facility.name }));
                              setDeliverySearch(facility.name);
                              setShowDeliveryResults(false);
                            }}
                            className="p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-0"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <p className="text-sm font-bold font-sans">{facility.name}</p>
                            <p style={{ color: 'var(--muted-foreground)' }} className="text-xs font-medium font-sans">{facility.address}</p>
                            <p style={{ color: 'var(--primary)' }} className="text-[10px] font-bold font-sans uppercase mt-1">Dock Hours: {facility.hours}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.deliveryLocation && <p style={{ color: 'var(--destructive)' }} className="text-sm font-medium font-sans">{errors.deliveryLocation}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Delivery Date/Time</label>
                    <input 
                      type="datetime-local"
                      name="deliveryDateTime"
                      value={formData.deliveryDateTime}
                      onChange={handleChange}
                      style={{ backgroundColor: 'var(--muted)', borderColor: errors.deliveryDateTime ? 'var(--destructive)' : 'var(--border)', color: 'var(--foreground)' }}
                      className={`w-full px-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                    />
                    {errors.deliveryDateTime && <p style={{ color: 'var(--destructive)' }} className="text-sm font-medium font-sans">{errors.deliveryDateTime}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 style={{ color: 'var(--muted-foreground)', borderBottomColor: 'var(--border)' }} className="text-xs font-bold font-sans uppercase tracking-[0.2em] border-b pb-2">Load Specifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Equipment</label>
                    <select 
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleChange}
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full px-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option>Standard Trailer</option>
                      <option>Refrigerated</option>
                      <option>Flatbed</option>
                      <option>Container</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Weight (kg)</label>
                    <input 
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="e.g. 24,000"
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full px-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Pallet Count</label>
                    <input 
                      type="number"
                      name="palletCount"
                      value={formData.palletCount}
                      onChange={handleChange}
                      placeholder="33"
                      style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      className="w-full px-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">ADR/Hazardous</label>
                    <div className="flex items-center h-[46px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="isHazardous"
                          checked={formData.isHazardous}
                          onChange={handleChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ml-3 text-sm font-medium font-sans" style={{ color: formData.isHazardous ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                          {formData.isHazardous ? 'Hazardous' : 'Standard'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Handling Accordion */}
              <div style={{ borderColor: 'var(--border)' }} className="border rounded-2xl overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  style={{ backgroundColor: 'var(--muted)' }}
                  className="w-full px-5 py-4 flex justify-between items-center hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    <span style={{ color: 'var(--foreground)' }} className="text-sm font-bold font-sans uppercase tracking-widest">Advanced Handling</span>
                  </div>
                  {isAdvancedOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <AnimatePresence>
                  {isAdvancedOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 space-y-5">
                        <div className="space-y-1.5">
                          <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Loading Method</label>
                          <select 
                            name="loadingMethod"
                            value={formData.loadingMethod}
                            onChange={handleChange}
                            style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            className="w-full px-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          >
                            <option>Standard Side (Curtain-side)</option>
                            <option>Rear (Dock loading)</option>
                            <option>Top (Crane)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Stackable Pallets</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              name="isStackable"
                              checked={formData.isStackable}
                              onChange={handleChange}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            <span className="ml-3 text-xs font-bold font-sans uppercase" style={{ color: formData.isStackable ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                              {formData.isStackable ? 'YES' : 'NO'}
                            </span>
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Reference / PO Number</label>
                          <input 
                            name="referenceNumber"
                            value={formData.referenceNumber}
                            onChange={handleChange}
                            placeholder="e.g. PO-98210-X"
                            style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            className="w-full px-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <h4 style={{ color: 'var(--muted-foreground)', borderBottomColor: 'var(--border)' }} className="text-xs font-bold font-sans uppercase tracking-[0.2em] border-b pb-2">Financials</h4>
                <div className="space-y-1.5">
                  <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Target Price (€)</label>
                  <input 
                    name="targetPrice"
                    value={formData.targetPrice}
                    onChange={handleChange}
                    placeholder="e.g. 1,200"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full px-4 py-2.5 border rounded-xl text-base font-normal font-sans focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 style={{ color: 'var(--muted-foreground)', borderBottomColor: 'var(--border)' }} className="text-xs font-bold font-sans uppercase tracking-[0.2em] border-b pb-2">Route Preview</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative h-48 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    {/* Map Placeholder */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d="M 20 80 Q 50 20 80 80" 
                        fill="none" 
                        stroke="var(--primary)" 
                        strokeWidth="2" 
                        strokeDasharray="4 2"
                        className="animate-pulse"
                      />
                      <circle cx="20" cy="80" r="3" fill="var(--primary)" />
                      <circle cx="80" cy="80" r="3" fill="var(--primary)" />
                    </svg>
                    <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-border text-[10px] font-bold font-mono uppercase tracking-widest">
                      Live Preview
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p style={{ color: 'var(--muted-foreground)' }} className="text-xs font-bold font-sans uppercase tracking-widest">Est. Drive Time: <span style={{ color: 'var(--foreground)' }}>19h 45m</span></p>
                    <div className="flex gap-2">
                      {['A6', 'A9'].map((route) => (
                        <button
                          key={route}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, selectedRoute: route }))}
                          style={{ 
                            backgroundColor: formData.selectedRoute === route ? 'var(--primary)' : 'var(--muted)',
                            color: formData.selectedRoute === route ? 'var(--primary-foreground)' : 'var(--foreground)',
                            borderColor: formData.selectedRoute === route ? 'var(--primary)' : 'var(--border)'
                          }}
                          className="px-3 py-1.5 border rounded-lg text-[10px] font-bold font-sans transition-all text-center uppercase tracking-widest"
                        >
                          {route}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div style={{ borderTopColor: 'var(--border)', backgroundColor: 'var(--card)' }} className="p-6 border-t space-y-4">
              <button 
                onClick={handleSubmit}
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                className="w-full py-4 rounded-2xl font-bold font-sans text-sm transition-all shadow-lg active:scale-95 uppercase tracking-widest"
              >
                Post Load to Network
              </button>
              <button 
                type="button"
                style={{ color: 'var(--primary)' }}
                className="w-full text-center text-xs font-bold font-sans uppercase tracking-widest hover:underline"
              >
                Save as Template
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ShipmentTrackingModal = ({ onClose }: { onClose: () => void }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);

  const handleTrack = () => {
    if (!trackingNumber) return;
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingResult({
        id: trackingNumber,
        status: 'In Transit',
        location: 'Lyon, France',
        lastUpdate: '10 minutes ago',
        eta: '2026-04-01 14:00',
        carrier: 'Swift Logistics',
        progress: 65,
        history: [
          { time: '08:00 AM', event: 'Departed Warehouse', location: 'Berlin, DE' },
          { time: '12:30 PM', event: 'Border Crossing', location: 'Strasbourg, FR' },
          { time: '02:45 PM', event: 'In Transit', location: 'Lyon, FR' },
        ]
      });
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        className="relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div style={{ borderBottomColor: 'var(--border)' }} className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 style={{ color: 'var(--foreground)' }} className="text-2xl font-semibold font-sans tracking-tight">Shipment Tracking</h3>
            <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans">Real-time visibility into your active freight.</p>
          </div>
          <button 
            onClick={onClose}
            style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
            className="p-2 rounded-xl hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          {!trackingResult ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-widest">Enter Tracking Number</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} size={20} />
                  <input 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. PH-842910"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    className="w-full pl-12 pr-4 py-4 border rounded-2xl text-base font-normal font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={handleTrack}
                disabled={isSearching || !trackingNumber}
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                className="w-full py-4 rounded-2xl font-bold font-sans text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Locating Shipment...
                  </>
                ) : (
                  <>
                    <Navigation size={18} />
                    Track Shipment
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <span style={{ color: 'var(--primary)', backgroundColor: 'var(--primary)/10' }} className="px-2 py-1 rounded text-xs font-medium font-sans uppercase tracking-widest mb-2 inline-block">
                    {trackingResult.status}
                  </span>
                  <h4 style={{ color: 'var(--foreground)' }} className="text-4xl font-bold font-sans tracking-tighter">{trackingResult.id}</h4>
                  <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans mt-1">Last updated {trackingResult.lastUpdate}</p>
                </div>
                <button 
                  onClick={() => setTrackingResult(null)}
                  style={{ color: 'var(--primary)' }}
                  className="text-sm font-medium font-sans hover:underline"
                >
                  Track another
                </button>
              </div>

              <div style={{ backgroundColor: 'var(--muted)' }} className="p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-sm font-medium font-sans">
                  <span style={{ color: 'var(--muted-foreground)' }}>Current Location</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    <MapPin size={14} style={{ color: 'var(--primary)' }} />
                    {trackingResult.location}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium font-sans">
                  <span style={{ color: 'var(--muted-foreground)' }}>Estimated Arrival</span>
                  <span className="font-semibold">{trackingResult.eta}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium font-sans uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                    <span>Progress</span>
                    <span>{trackingResult.progress}%</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--card)' }} className="h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${trackingResult.progress}%` }}
                      style={{ backgroundColor: 'var(--primary)' }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium font-sans uppercase tracking-widest border-b border-border pb-2">Tracking History</h5>
                <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                  {trackingResult.history.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 relative">
                      <div 
                        style={{ backgroundColor: i === 0 ? 'var(--primary)' : 'var(--card)', borderColor: i === 0 ? 'var(--primary)' : 'var(--border)' }} 
                        className="w-4 h-4 rounded-full border-2 z-10 mt-1 flex-shrink-0" 
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium font-sans">{item.event}</p>
                          <span style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-mono">{item.time}</span>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-normal font-sans">{item.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'loadboard' | 'network' | 'lifecycle'>('loadboard');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [loads, setLoads] = useState<Load[]>([
    { id: 'PH-842910', alert: true, origin: 'Berlin, DE', destination: 'Paris, FR', date: '2026-04-01', customer: 'Fresh Foods Co.', carrier: 'Swift Logistics', status: 'In Transit', weight: '24,000 kg', volume: '33 Pallets', vehicleType: 'Refrigerated' },
    { id: 'PH-129482', alert: false, origin: 'Madrid, ES', destination: 'Lisbon, PT', date: '2026-04-02', customer: 'AutoParts Inc.', carrier: 'Eagle Express', status: 'Booked', weight: '12,500 kg', volume: '18 Pallets', vehicleType: 'Standard Trailer' },
    { id: 'PH-992811', alert: false, origin: 'Warsaw, PL', destination: 'Prague, CZ', date: '2026-04-01', customer: 'TechMart Retail', carrier: 'Global Trans', status: 'Tendered', weight: '8,000 kg', volume: '12 Pallets', vehicleType: 'Dry Van' },
    { id: 'PH-441290', alert: true, origin: 'Milan, IT', destination: 'Munich, DE', date: '2026-04-03', customer: 'Global Bev', carrier: 'Blue Sky Trucking', status: 'In Transit', weight: '22,000 kg', volume: '26 Pallets', vehicleType: 'Curtain Side' },
  ]);

  const handleAddLoad = (newLoad: Load) => {
    setLoads([newLoad, ...loads]);
    setIsPostModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="flex h-screen font-sans overflow-hidden">
      <AnimatePresence>
        {selectedLoad && (
          <LoadDetailModal 
            load={selectedLoad} 
            onClose={() => setSelectedLoad(null)} 
          />
        )}
        <CreateLoadDrawer 
          isOpen={isPostModalOpen}
          onSave={handleAddLoad}
          onClose={() => setIsPostModalOpen(false)}
        />
        {isTrackingModalOpen && (
          <ShipmentTrackingModal 
            onClose={() => setIsTrackingModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* --- Sidebar --- */}
      <aside style={{ backgroundColor: 'var(--sidebar)', borderRightColor: 'var(--sidebar-border)' }} className="w-64 border-r flex flex-col fixed h-full z-10">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2.5 mb-10 px-2">
            <div style={{ backgroundColor: 'var(--primary)' }} className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg">
              <Ship style={{ color: 'var(--primary-foreground)' }} size={20} />
            </div>
            <div>
              <h1 style={{ color: 'var(--foreground)' }} className="text-xl font-black tracking-tighter leading-none font-sans">PHAROS</h1>
              <p style={{ color: 'var(--primary)' }} className="text-sm font-medium font-sans uppercase tracking-[0.2em] mt-1">Logistics</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarSection title="Operations">
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Global Loadboard" 
                active={currentView === 'loadboard'} 
                onClick={() => setCurrentView('loadboard')}
              />
              <SidebarItem 
                icon={Play} 
                label="Lifecycle Engine" 
                active={currentView === 'lifecycle'} 
                onClick={() => setCurrentView('lifecycle')}
              />
              <SidebarItem icon={Truck} label="My Shipments" />
            </SidebarSection>

            <SidebarSection title="Network">
              <SidebarItem 
                icon={Users} 
                label="Network Directory" 
                active={currentView === 'network'} 
                onClick={() => setCurrentView('network')}
              />
            </SidebarSection>

            <SidebarSection title="Performance">
              <SidebarItem icon={BarChart3} label="Analytics" />
              <SidebarItem icon={Leaf} label="Sustainability" />
            </SidebarSection>

            <SidebarSection title="Finance">
              <SidebarItem icon={CreditCard} label="Invoices" />
              <SidebarItem icon={FileText} label="Payments" />
            </SidebarSection>

            <SidebarSection title="System">
              <SidebarItem icon={Settings} label="Settings" />
            </SidebarSection>
          </nav>

          <div style={{ borderTopColor: 'var(--sidebar-border)' }} className="mt-auto pt-6 border-t">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent cursor-pointer transition-all duration-200 group">
              <div style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--card)' }} className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 shadow-sm">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--foreground)' }} className="text-sm font-bold truncate">Joe Doe</p>
                <p style={{ color: 'var(--muted-foreground)' }} className="text-[11px] truncate">joe@acmecorp.com</p>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} className="group-hover:text-foreground transition-colors" />
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto">
          {currentView === 'lifecycle' ? (
            <FreightLifecycleEngine />
          ) : currentView === 'loadboard' ? (
            <>
              {/* Header */}
              <header className="flex justify-between items-end mb-10">
                <div>
                  <div style={{ color: 'var(--primary)' }} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-1 rounded-full" />
                    Live Operations
                  </div>
                  <h2 style={{ color: 'var(--foreground)' }} className="text-4xl font-bold tracking-tight">Global Loadboard</h2>
                  <p style={{ color: 'var(--muted-foreground)' }} className="text-sm mt-2 max-w-md">Real-time oversight of your freight partners and active transportation network.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsTrackingModalOpen(true)}
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                    className="px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 border transition-all hover:bg-muted/80 active:scale-95"
                  >
                    <Activity size={18} style={{ color: 'var(--primary)' }} />
                    Track Shipment
                  </button>
                  <button 
                    onClick={() => setIsPostModalOpen(true)}
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    className="px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    <Plus size={18} />
                    Add New Load
                  </button>
                </div>
              </header>

              {/* KPI Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPICard 
                  title="Revenue" 
                  value="€128,540" 
                  subtext="Gross revenue this month" 
                  trend="+12.4%" 
                />
                <KPICard 
                  title="Active Loads" 
                  value="34" 
                  subtext="Currently in transit" 
                  trend="0%" 
                />
                <KPICard 
                  title="Urgency / Risk" 
                  value="7" 
                  subtext="Loads requiring attention" 
                  trend="+2" 
                />
                <KPICard 
                  title="ESG Score" 
                  value="A+" 
                  subtext="Sustainability performance" 
                  trend="+0.4" 
                />
              </div>

              {/* Load List */}
              <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="border rounded-2xl overflow-hidden shadow-sm">
                <div style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }} className="p-6 border-b flex justify-between items-center">
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} size={16} />
                      <input 
                        placeholder="Search loads, IDs, routes..." 
                        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all w-72"
                      />
                    </div>
                    <button style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold hover:bg-muted transition-all shadow-sm">
                      <Filter size={16} />
                      Filters
                    </button>
                  </div>
                  <div style={{ color: 'var(--muted-foreground)' }} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <div style={{ backgroundColor: 'var(--color-success-foreground)' }} className="w-1.5 h-1.5 rounded-full animate-pulse" />
                    System Live: Just now
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="border-b">
                        <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Load ID</th>
                        <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Route</th>
                        <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Pickup Date</th>
                        <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Customer</th>
                        <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Carrier</th>
                        <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                        <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--foreground)' }} className="divide-y divide-border">
                      {loads.map((load) => (
                        <tr 
                          key={load.id} 
                          onClick={() => setSelectedLoad(load)}
                          className="hover:bg-muted/50 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2.5">
                              {load.alert && (
                                <div style={{ backgroundColor: 'var(--destructive)' }} className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(217,60,21,0.5)]" />
                              )}
                              <span className="font-mono text-xs font-bold tracking-tight">{load.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-semibold">{load.origin}</span>
                              <ArrowRight size={14} style={{ color: 'var(--muted-foreground)' }} />
                              <span className="font-semibold">{load.destination}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div style={{ color: 'var(--muted-foreground)' }} className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span className="font-mono text-xs font-medium">{load.date}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2.5">
                              <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="w-7 h-7 rounded-lg flex items-center justify-center border">
                                <Building2 size={14} style={{ color: 'var(--muted-foreground)' }} />
                              </div>
                              <span className="text-sm font-semibold">{load.customer}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2.5">
                              <div style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--border)' }} className="w-7 h-7 rounded-lg flex items-center justify-center border">
                                <Truck size={14} style={{ color: 'var(--primary)' }} />
                              </div>
                              <span className="text-sm font-semibold">{load.carrier}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge status={load.status} />
                          </td>
                          <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <button style={{ color: 'var(--muted-foreground)' }} className="p-2 hover:bg-muted rounded-lg transition-colors hover:text-foreground">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <NetworkDirectory />
          )}
        </div>
      </main>
    </div>
  );
}
