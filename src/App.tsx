import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { CatalogScreen } from './pages/CatalogScreen';
import { BookEditorScreen } from './pages/BookEditorScreen';
import { CreateScreen } from './pages/CreateScreen';
import { CreatorPortal } from './pages/CreatorPortal';
import { HomeScreen } from './pages/HomeScreen';
import { KeepsakeDetailScreen } from './pages/KeepsakeDetailScreen';
import { KeepsakesScreen } from './pages/KeepsakesScreen';
import { MarketplaceScreen } from './pages/MarketplaceScreen';
import { MemoryMapScreen } from './pages/MemoryMapScreen';
import { MemoryBoxScreen } from './pages/MemoryBoxScreen';
import { PaywallScreen } from './pages/PaywallScreen';
import { PhotoDetailScreen } from './pages/PhotoDetailScreen';
import { QrViewScreen } from './pages/QrViewScreen';
import { ScrapbooksScreen } from './pages/ScrapbooksScreen';
import { TemplateEditorScreen } from './pages/TemplateEditorScreen';
import { TimelineScreen } from './pages/TimelineScreen';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/yourself" element={<CatalogScreen path="/yourself" />} />
        <Route path="/someone" element={<CatalogScreen path="/someone" />} />
        <Route path="/moments" element={<CatalogScreen path="/moments" />} />
        <Route path="/creative" element={<CatalogScreen path="/creative" />} />
        <Route path="/unlockables" element={<CatalogScreen path="/unlockables" />} />
        <Route path="/create" element={<CreateScreen />} />
        <Route path="/keepsakes" element={<KeepsakesScreen />} />
        <Route path="/keepsakes/:id" element={<KeepsakeDetailScreen />} />
        <Route path="/marketplace" element={<MarketplaceScreen />} />
        <Route path="/marketplace/:id" element={<MarketplaceScreen />} />
        <Route path="/memory-map" element={<MemoryMapScreen />} />
        <Route path="/creator-portal" element={<CreatorPortal />} />
        <Route path="/timeline" element={<TimelineScreen />} />
        <Route path="/memory-box" element={<MemoryBoxScreen />} />
        <Route path="/memory-box/:id" element={<PhotoDetailScreen />} />
        <Route path="/template-editor" element={<TemplateEditorScreen />} />
        <Route path="/scrapbooks" element={<ScrapbooksScreen />} />
        <Route path="/scrapbooks/:id" element={<BookEditorScreen />} />
        <Route path="/qr/:id" element={<QrViewScreen />} />
        <Route path="/paywall" element={<PaywallScreen />} />
      </Route>
    </Routes>
  );
}
