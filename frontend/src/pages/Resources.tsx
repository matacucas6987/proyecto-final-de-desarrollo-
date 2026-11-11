import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { resourcesService } from '../services/api';
import {
  Resource,
  CollectionType,
  ResourceStatus,
  TechDeviceType,
} from '../types';
import {
  Book,
  Bookmark,
  Compass,
  Newspaper,
  Map as MapIcon,
  Tablet,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Trash2,
  MapPin,
  Layers,
} from 'lucide-react';

export const Resources: React.FC = () => {
  const { success, error } = useNotification();
  const { canManageResources } = useAuth();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ResourceStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Datos base
  const [baseForm, setBaseForm] = useState({
    title: '',
    code: '',
    collection: CollectionType.GENERAL,
    location: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    status: ResourceStatus.DISPONIBLE,
  });

  // Datos específicos de colección
  const [generalData, setGeneralData] = useState({
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    edition: '',
    pages: 100,
  });

  const [reserveData, setReserveData] = useState({
    courseCode: '',
    courseName: '',
    professorName: '',
    academicDepartment: '',
    semester: '2026-1',
    maxLoanHours: 2,
  });

  const [referenceData, setReferenceData] = useState({
    subjectArea: '',
    volumeNumber: '',
    publisher: '',
    consultationOnly: true,
  });

  const [periodicalData, setPeriodicalData] = useState({
    issn: '',
    issueNumber: '',
    volume: '',
    periodicity: 'Mensual',
  });

  const [mapData, setMapData] = useState({
    geographicArea: '',
    scale: '1:50000',
    cartographer: '',
    projectionType: 'UTM',
    dimensions: '',
  });

  const [techData, setTechData] = useState({
    deviceType: TechDeviceType.LAPTOP,
    brand: '',
    model: '',
    serialNumber: '',
    hasCharger: true,
    hasStylus: false,
    specifications: '',
  });

  const collections = [
    { type: CollectionType.GENERAL, label: 'General (Libros)', icon: <Book className="w-4 h-4" /> },
    { type: CollectionType.RESERVA, label: 'Reserva (Académicos)', icon: <Bookmark className="w-4 h-4" /> },
    { type: CollectionType.REFERENCIA, label: 'Referencia (Diccionarios)', icon: <Compass className="w-4 h-4" /> },
    { type: CollectionType.HEMEROTECA, label: 'Hemeroteca (Revistas)', icon: <Newspaper className="w-4 h-4" /> },
    { type: CollectionType.MAPOTECA, label: 'Mapoteca (Mapas)', icon: <MapIcon className="w-4 h-4" /> },
    { type: CollectionType.TECNOTECA, label: 'Tecnoteca (Dispositivos)', icon: <Tablet className="w-4 h-4" /> },
  ];

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resourcesService.getAll();
      setResources(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar recursos';
      error(msg, 'Error de Carga');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Enviar nuevo recurso
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseForm.title.trim() || !baseForm.code.trim()) {
      error('El título y código del recurso son obligatorios.', 'Campos requeridos');
      return;
    }

    // Preparar objeto de colección específico
    let collectionData: Record<string, unknown> = {};
    switch (baseForm.collection) {
      case CollectionType.GENERAL:
        collectionData = { ...generalData };
        break;
      case CollectionType.RESERVA:
        collectionData = { ...reserveData };
        break;
      case CollectionType.REFERENCIA:
        collectionData = { ...referenceData };
        break;
      case CollectionType.HEMEROTECA:
        collectionData = { ...periodicalData };
        break;
      case CollectionType.MAPOTECA:
        collectionData = { ...mapData };
        break;
      case CollectionType.TECNOTECA:
        collectionData = { ...techData };
        break;
    }

    setSubmitting(true);
    try {
      await resourcesService.create({
        title: baseForm.title.trim(),
        code: baseForm.code.trim().toUpperCase(),
        collection: baseForm.collection,
        status: baseForm.status,
        location: baseForm.location.trim() || undefined,
        acquisitionDate: baseForm.acquisitionDate || undefined,
        collectionData,
      });

      success('El recurso ha sido ingresado al catálogo correctamente.', 'Recurso Registrado');
      setIsModalOpen(false);
      // Reset form
      setBaseForm({
        title: '',
        code: '',
        collection: CollectionType.GENERAL,
        location: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        status: ResourceStatus.DISPONIBLE,
      });
      fetchResources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar recurso';
      error(msg, 'Fallo al Crear');
    } finally {
      setSubmitting(false);
    }
  };

  // Cambiar estado de un recurso
  const handleStatusChange = async (id: string, newStatus: ResourceStatus) => {
    try {
      await resourcesService.updateStatus(id, newStatus);
      success(`Estado actualizado a: ${newStatus}`, 'Estado Modificado');
      fetchResources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
      error(msg);
    }
  };

  // Eliminar recurso
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el recurso "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await resourcesService.delete(id);
      success('Recurso removido del catálogo universitario.', 'Recurso Eliminado');
      fetchResources();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el recurso';
      error(msg);
    }
  };

  // Filtrado de recursos
  const filteredResources = resources.filter((item) => {
    const matchesCollection =
      selectedCollection === 'ALL' || item.collection === selectedCollection;
    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      (item.location && item.location.toLowerCase().includes(query));
    return matchesCollection && matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Catálogo y Colecciones
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de las 6 colecciones bibliográficas y tecnológicas de la Universidad de Madeira.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchResources}
            isLoading={loading}
            title="Recargar catálogo"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>
          {canManageResources && (
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Recurso</span>
            </Button>
          )}
        </div>
      </div>

      {/* Selector de Colecciones */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5">
        <button
          onClick={() => setSelectedCollection('ALL')}
          className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${
            selectedCollection === 'ALL'
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-1.5 w-fit rounded-lg ${
              selectedCollection === 'ALL' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Todas</span>
            <span className="text-[10px] opacity-80">{resources.length} items</span>
          </div>
        </button>

        {collections.map((col) => {
          const count = resources.filter((r) => r.collection === col.type).length;
          const isSelected = selectedCollection === col.type;

          return (
            <button
              key={col.type}
              onClick={() => setSelectedCollection(col.type)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-500 text-indigo-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-1.5 w-fit rounded-lg ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {col.icon}
              </div>
              <div>
                <span className="text-xs font-bold block truncate">{col.label}</span>
                <span className="text-[10px] text-slate-400 font-medium">{count} items</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, signatura topográfica, código o ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ResourceStatus)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          >
            <option value="ALL">Todos ({resources.length})</option>
            <option value={ResourceStatus.DISPONIBLE}>{ResourceStatus.DISPONIBLE}</option>
            <option value={ResourceStatus.PRESTADO}>{ResourceStatus.PRESTADO}</option>
            <option value={ResourceStatus.RESERVADO}>{ResourceStatus.RESERVADO}</option>
            <option value={ResourceStatus.PERDIDO}>{ResourceStatus.PERDIDO}</option>
            <option value={ResourceStatus.DADO_DE_BAJA}>{ResourceStatus.DADO_DE_BAJA}</option>
          </select>
        </div>
      </div>

      {/* Contenedor de Recursos */}
      <Card>
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Cargando catálogo bibliográfico...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-14">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
              <Book className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              No se encontraron recursos
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No existen elementos en la colección seleccionada o que coincidan con la búsqueda.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-1" /> Registrar nuevo recurso
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Código / Signatura</th>
                  <th className="py-3.5 px-4">Título y Detalles</th>
                  <th className="py-3.5 px-4">Colección</th>
                  <th className="py-3.5 px-4">Ubicación</th>
                  <th className="py-3.5 px-4">Estado</th>
                  {canManageResources && <th className="py-3.5 px-6 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.map((item) => {
                  const statusVariant = {
                    [ResourceStatus.DISPONIBLE]: 'success',
                    [ResourceStatus.PRESTADO]: 'info',
                    [ResourceStatus.RESERVADO]: 'warning',
                    [ResourceStatus.PERDIDO]: 'danger',
                    [ResourceStatus.DADO_DE_BAJA]: 'neutral',
                  }[item.status] as 'success' | 'info' | 'warning' | 'danger' | 'neutral';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                          {item.code}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                        {/* Detalles específicos según tipo de colección */}
                        {item.generalBook && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Autor: <span className="font-medium text-slate-700">{item.generalBook.author}</span>
                            {item.generalBook.isbn && ` • ISBN: ${item.generalBook.isbn}`}
                          </p>
                        )}
                        {item.reserveBook && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Curso: <span className="font-medium text-slate-700">{item.reserveBook.courseName}</span> ({item.reserveBook.courseCode}) • Prof: {item.reserveBook.professorName}
                          </p>
                        )}
                        {item.referenceMaterial && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Área: <span className="font-medium text-slate-700">{item.referenceMaterial.subjectArea}</span>
                            {item.referenceMaterial.consultationOnly && ' • Exclusivo Sala'}
                          </p>
                        )}
                        {item.periodical && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            ISSN: {item.periodical.issn} • Edición: {item.periodical.issueNumber || 'N/A'} • {item.periodical.periodicity}
                          </p>
                        )}
                        {item.mapItem && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Área: {item.mapItem.geographicArea} • Escala: {item.mapItem.scale}
                          </p>
                        )}
                        {item.techDevice && (
                          <p className="text-xs text-slate-500 mt-0.5 font-mono">
                            {item.techDevice.deviceType}: {item.techDevice.brand} {item.techDevice.model} (S/N: {item.techDevice.serialNumber})
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                          {item.collection}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {item.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.location}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No especificada</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={statusVariant}>{item.status}</Badge>
                      </td>
                      {canManageResources && (
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Selector rápido de estado */}
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as ResourceStatus)}
                              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              title="Cambiar estado del recurso"
                            >
                              <option value={ResourceStatus.DISPONIBLE}>Marcar Disponible</option>
                              <option value={ResourceStatus.PRESTADO}>Marcar Prestado</option>
                              <option value={ResourceStatus.RESERVADO}>Marcar Reservado</option>
                              <option value={ResourceStatus.PERDIDO}>Marcar Perdido</option>
                              <option value={ResourceStatus.DADO_DE_BAJA}>Dar de Baja</option>
                            </select>

                            <button
                              onClick={() => handleDelete(item.id, item.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar recurso del catálogo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Registro de Recurso */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Recurso"
        subtitle="Ingresa la ficha bibliográfica o tecnológica al catálogo oficial."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ficha Base */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Título / Descripción Principal *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Cálculo Multivariable, Atlas Cartográfico, Laptop Dell..."
                value={baseForm.title}
                onChange={(e) => setBaseForm({ ...baseForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Código / Signatura Topográfica *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. QA-303-S84, TEC-001"
                value={baseForm.code}
                onChange={(e) => setBaseForm({ ...baseForm, code: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Colección Universitaria *
              </label>
              <select
                value={baseForm.collection}
                onChange={(e) => setBaseForm({ ...baseForm, collection: e.target.value as CollectionType })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {collections.map((col) => (
                  <option key={col.type} value={col.type}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ubicación Física
              </label>
              <input
                type="text"
                placeholder="Ej. Estante A-4, Vitrina 2, Sala Tecnoteca"
                value={baseForm.location}
                onChange={(e) => setBaseForm({ ...baseForm, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Adquisición
              </label>
              <input
                type="date"
                value={baseForm.acquisitionDate}
                onChange={(e) => setBaseForm({ ...baseForm, acquisitionDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Sección Dinámica según Colección */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              Datos Específicos: {baseForm.collection}
            </h4>

            {/* General (Libros) */}
            {baseForm.collection === CollectionType.GENERAL && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Autor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. James Stewart"
                    value={generalData.author}
                    onChange={(e) => setGeneralData({ ...generalData, author: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ISBN</label>
                  <input
                    type="text"
                    placeholder="Ej. 978-0134685991"
                    value={generalData.isbn}
                    onChange={(e) => setGeneralData({ ...generalData, isbn: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Editorial</label>
                  <input
                    type="text"
                    placeholder="Ej. Pearson, McGraw-Hill"
                    value={generalData.publisher}
                    onChange={(e) => setGeneralData({ ...generalData, publisher: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Año de Publicación</label>
                  <input
                    type="number"
                    value={generalData.publicationYear}
                    onChange={(e) => setGeneralData({ ...generalData, publicationYear: parseInt(e.target.value) || 2026 })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Reserva (Libros Académicos) */}
            {baseForm.collection === CollectionType.RESERVA && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Código del Curso *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. MAT-101"
                    value={reserveData.courseCode}
                    onChange={(e) => setReserveData({ ...reserveData, courseCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre de la Asignatura</label>
                  <input
                    type="text"
                    placeholder="Ej. Cálculo I"
                    value={reserveData.courseName}
                    onChange={(e) => setReserveData({ ...reserveData, courseName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Profesor Encargado</label>
                  <input
                    type="text"
                    placeholder="Ej. Dr. Mario Silva"
                    value={reserveData.professorName}
                    onChange={(e) => setReserveData({ ...reserveData, professorName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Horas Máximas Préstamo en Sala</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={reserveData.maxLoanHours}
                    onChange={(e) => setReserveData({ ...reserveData, maxLoanHours: parseInt(e.target.value) || 2 })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Referencia (Diccionarios / Enciclopedias) */}
            {baseForm.collection === CollectionType.REFERENCIA && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Área Temática *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Medicina, Filosofía, Ciencias Jurídicas"
                    value={referenceData.subjectArea}
                    onChange={(e) => setReferenceData({ ...referenceData, subjectArea: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Volumen / Tomo</label>
                  <input
                    type="text"
                    placeholder="Ej. Tomo III"
                    value={referenceData.volumeNumber}
                    onChange={(e) => setReferenceData({ ...referenceData, volumeNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Hemeroteca (Revistas / Publicaciones periódicas) */}
            {baseForm.collection === CollectionType.HEMEROTECA && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ISSN</label>
                  <input
                    type="text"
                    placeholder="Ej. 1234-5679"
                    value={periodicalData.issn}
                    onChange={(e) => setPeriodicalData({ ...periodicalData, issn: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Periodicidad</label>
                  <select
                    value={periodicalData.periodicity}
                    onChange={(e) => setPeriodicalData({ ...periodicalData, periodicity: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value="Mensual">Mensual</option>
                    <option value="Bimestral">Bimestral</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              </div>
            )}

            {/* Mapoteca */}
            {baseForm.collection === CollectionType.MAPOTECA && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Área Geográfica *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Isla de Madeira, Océano Atlántico Norte"
                    value={mapData.geographicArea}
                    onChange={(e) => setMapData({ ...mapData, geographicArea: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Escala Cartográfica</label>
                  <input
                    type="text"
                    placeholder="Ej. 1:25000"
                    value={mapData.scale}
                    onChange={(e) => setMapData({ ...mapData, scale: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Tecnoteca (Laptops y Tablets) */}
            {baseForm.collection === CollectionType.TECNOTECA && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Dispositivo *</label>
                  <select
                    value={techData.deviceType}
                    onChange={(e) => setTechData({ ...techData, deviceType: e.target.value as TechDeviceType })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value={TechDeviceType.LAPTOP}>Laptop</option>
                    <option value={TechDeviceType.TABLET}>Tableta Digital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número de Serie *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. SN-DEL-89213"
                    value={techData.serialNumber}
                    onChange={(e) => setTechData({ ...techData, serialNumber: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Lenovo, Dell, Apple"
                    value={techData.brand}
                    onChange={(e) => setTechData({ ...techData, brand: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ej. ThinkPad L14, iPad 10th"
                    value={techData.model}
                    onChange={(e) => setTechData({ ...techData, model: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción del Modal */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Guardar en Catálogo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;
