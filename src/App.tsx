import { lazy, Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';

const HomeScreen = lazyRoute(() => import('./pages/HomeScreen'), 'HomeScreen');
const CatalogScreen = lazyRoute(() => import('./pages/CatalogScreen'), 'CatalogScreen');
const BookEditorScreen = lazyRoute(() => import('./pages/BookEditorScreen'), 'BookEditorScreen');
const CreateScreen = lazyRoute(() => import('./pages/CreateScreen'), 'CreateScreen');
const CreatorPortal = lazyRoute(() => import('./pages/CreatorPortal'), 'CreatorPortal');
const KeepsakeDetailScreen = lazyRoute(() => import('./pages/KeepsakeDetailScreen'), 'KeepsakeDetailScreen');
const KeepsakesScreen = lazyRoute(() => import('./pages/KeepsakesScreen'), 'KeepsakesScreen');
const MarketplaceScreen = lazyRoute(() => import('./pages/MarketplaceScreen'), 'MarketplaceScreen');
const MemoryMapScreen = lazyRoute(() => import('./pages/MemoryMapScreen'), 'MemoryMapScreen');
const MemoryBoxScreen = lazyRoute(() => import('./pages/MemoryBoxScreen'), 'MemoryBoxScreen');
const PaywallScreen = lazyRoute(() => import('./pages/PaywallScreen'), 'PaywallScreen');
const PhotoDetailScreen = lazyRoute(() => import('./pages/PhotoDetailScreen'), 'PhotoDetailScreen');
const QrViewScreen = lazyRoute(() => import('./pages/QrViewScreen'), 'QrViewScreen');
const ScrapbooksScreen = lazyRoute(() => import('./pages/ScrapbooksScreen'), 'ScrapbooksScreen');
const TemplateEditorScreen = lazyRoute(() => import('./pages/TemplateEditorScreen'), 'TemplateEditorScreen');
const TimelineScreen = lazyRoute(() => import('./pages/TimelineScreen'), 'TimelineScreen');

function lazyRoute<T extends ComponentType<any>>(
  importer: () => Promise<Record<string, T>>,
  exportName: string,
) {
  return lazy(async () => {
    const module = await importer();
    return { default: module[exportName] };
  });
}

function RouteSuspense({ children, label = 'Loading Keepsake...' }: { children: ReactNode; label?: string }) {
  return (
    <Suspense
      fallback={
        <div className="ks-card mx-auto grid min-h-64 w-full max-w-2xl place-items-center p-6 text-center">
          <div>
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-keepsake-accent/70 shadow-glow" />
            <p className="mt-4 font-heading text-3xl font-bold text-keepsake-ink">{label}</p>
            <p className="mt-2 text-sm font-semibold text-keepsake-muted">Preparing this memory space.</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function lazyElement(children: ReactNode, label?: string) {
  return <RouteSuspense label={label}>{children}</RouteSuspense>;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={lazyElement(<HomeScreen />, 'Opening Keepsake...')} />
        <Route path="/yourself" element={lazyElement(<CatalogScreen path="/yourself" />, 'Loading ideas...')} />
        <Route path="/someone" element={lazyElement(<CatalogScreen path="/someone" />, 'Loading ideas...')} />
        <Route path="/moments" element={lazyElement(<CatalogScreen path="/moments" />, 'Loading ideas...')} />
        <Route path="/creative" element={lazyElement(<CatalogScreen path="/creative" />, 'Loading ideas...')} />
        <Route path="/unlockables" element={lazyElement(<CatalogScreen path="/unlockables" />, 'Loading ideas...')} />
        <Route path="/create" element={lazyElement(<CreateScreen />, 'Opening the keepsake form...')} />
        <Route path="/keepsakes" element={lazyElement(<KeepsakesScreen />, 'Loading your keepsakes...')} />
        <Route path="/keepsakes/:id" element={lazyElement(<KeepsakeDetailScreen />, 'Opening this keepsake...')} />
        <Route path="/marketplace" element={lazyElement(<MarketplaceScreen />, 'Loading the marketplace...')} />
        <Route path="/marketplace/:id" element={lazyElement(<MarketplaceScreen />, 'Loading the marketplace...')} />
        <Route path="/memory-map" element={lazyElement(<MemoryMapScreen />, 'Drawing the memory map...')} />
        <Route path="/creator-portal" element={lazyElement(<CreatorPortal />, 'Opening creator tools...')} />
        <Route path="/timeline" element={lazyElement(<TimelineScreen />, 'Loading your timeline...')} />
        <Route path="/memory-box" element={lazyElement(<MemoryBoxScreen />, 'Opening Memory Box...')} />
        <Route path="/memory-box/:id" element={lazyElement(<PhotoDetailScreen />, 'Opening photo details...')} />
        <Route path="/template-editor" element={lazyElement(<TemplateEditorScreen />, 'Opening the design studio...')} />
        <Route path="/scrapbooks" element={lazyElement(<ScrapbooksScreen />, 'Loading scrapbooks...')} />
        <Route path="/scrapbooks/:id" element={lazyElement(<BookEditorScreen />, 'Opening book editor...')} />
        <Route path="/qr/:id" element={lazyElement(<QrViewScreen />, 'Loading QR memory...')} />
        <Route path="/paywall" element={lazyElement(<PaywallScreen />, 'Loading subscription options...')} />
      </Route>
    </Routes>
  );
}
