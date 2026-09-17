import { useState, useRef } from 'react';
import { supabase } from '../hooks/useProducts';
import { parseCsv, csvToProductPayload, downloadCsvTemplate, type CSVProduct } from '../utils/csv-import';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  adminKey: string;
  onDone: () => void;
  existingHandles: string[];
}

export function CsvImportModal({ open, onClose, adminKey, onDone, existingHandles }: CsvImportModalProps) {
  const [parsed, setParsed] = useState<CSVProduct[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ added: number; updated: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reset = () => {
    setParsed([]);
    setFileName('');
    setResult(null);
    setDragOver(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const products = parseCsv(text);
      setParsed(products);
      if (products.length === 0) {
        setResult({ added: 0, updated: 0, errors: ['No valid product rows found. Check the CSV format and try again.'] });
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
  };

  const doImport = async () => {
    setImporting(true);
    setResult(null);
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const csvProduct of parsed) {
      const payload = csvToProductPayload(csvProduct);
      if (!payload.title || !payload.handle || !payload.category || !payload.sku || !payload.price) {
        errors.push(`Row skipped (missing required fields): ${payload.title || payload.handle || 'unknown'}`);
        continue;
      }

      const isUpdate = existingHandles.includes(payload.handle);
      const { error } = await supabase.rpc('admin_upsert_product', {
        p_password: adminKey,
        p_payload: payload,
        p_handle: isUpdate ? payload.handle : null,
      });

      if (error) {
        errors.push(`Failed: ${payload.title} — ${error.message}`);
      } else {
        if (isUpdate) updated++;
        else added++;
      }
    }

    setResult({ added, updated, errors });
    setImporting(false);
    if (errors.length === 0) {
      onDone();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-800" />
            <h2 className="font-serif text-xl font-bold text-stone-900">Import Products from CSV</h2>
          </div>
          <button onClick={handleClose} className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Import complete</p>
                  <p className="text-sm text-green-700">
                    {result.added} product{result.added !== 1 ? 's' : ''} added, {result.updated} updated.
                  </p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="font-semibold text-red-900 text-sm">{result.errors.length} row(s) had problems:</p>
                  </div>
                  <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-green-800 text-white rounded-full font-semibold text-sm hover:bg-green-900 transition-colors"
              >
                Done
              </button>
            </div>
          ) : parsed.length === 0 ? (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-green-700 bg-green-50' : 'border-stone-300 hover:border-stone-400'
                }`}
              >
                <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-stone-700 mb-1">
                  {fileName ? fileName : 'Drop your CSV file here or click to browse'}
                </p>
                <p className="text-xs text-stone-500">Only .csv files are supported</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-stone-700">Need the right format?</p>
                  <p className="text-xs text-stone-500">Download a template with all the correct columns.</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); downloadCsvTemplate(); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-800 border border-green-800 rounded-full hover:bg-green-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Template
                </button>
              </div>

              <div className="text-xs text-stone-500 space-y-1">
                <p className="font-semibold text-stone-700">Required columns:</p>
                <p>title, handle, description, category, price, compare_at_price, sku, tags, images, featured</p>
                <p className="pt-1">For multiple images or tags, use the pipe character (|) to separate them.</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">
                  {fileName} — <span className="font-semibold text-stone-900">{parsed.length} product{parsed.length !== 1 ? 's' : ''}</span> found
                </p>
                <button onClick={reset} className="text-xs text-stone-500 hover:text-stone-700">Choose different file</button>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-stone-700">Title</th>
                        <th className="text-left px-3 py-2 font-semibold text-stone-700">SKU</th>
                        <th className="text-right px-3 py-2 font-semibold text-stone-700">Price</th>
                        <th className="text-left px-3 py-2 font-semibold text-stone-700 hidden sm:table-cell">Category</th>
                        <th className="text-center px-3 py-2 font-semibold text-stone-700">Images</th>
                        <th className="text-center px-3 py-2 font-semibold text-stone-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {parsed.map((p, i) => {
                        const handle = p.handle || p.title.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                        const isUpdate = existingHandles.includes(handle);
                        const imageCount = p.images ? p.images.split('|').filter(Boolean).length : 0;
                        const hasMissing = !p.title || !p.handle || !p.category || !p.sku || !p.price;
                        return (
                          <tr key={i} className="hover:bg-stone-50">
                            <td className="px-3 py-2 text-stone-900 font-medium max-w-[160px] truncate">{p.title || <span className="text-red-500">Missing</span>}</td>
                            <td className="px-3 py-2 text-stone-600 font-mono">{p.sku || <span className="text-red-500">—</span>}</td>
                            <td className="px-3 py-2 text-right text-stone-600">{p.price || <span className="text-red-500">—</span>}</td>
                            <td className="px-3 py-2 text-stone-600 hidden sm:table-cell">{p.category || <span className="text-red-500">—</span>}</td>
                            <td className="px-3 py-2 text-center text-stone-500">{imageCount}</td>
                            <td className="px-3 py-2 text-center">
                              {hasMissing ? (
                                <span className="text-red-500 font-medium">Skip</span>
                              ) : isUpdate ? (
                                <span className="text-amber-600 font-medium">Update</span>
                              ) : (
                                <span className="text-green-700 font-medium">Add</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-700"></span> Add new</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Update existing</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Skip (missing data)</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={doImport}
                  disabled={importing}
                  className="flex-1 py-3 bg-green-800 text-white rounded-full font-semibold text-sm hover:bg-green-900 transition-colors disabled:opacity-50"
                >
                  {importing ? 'Importing...' : `Import ${parsed.length} Product${parsed.length !== 1 ? 's' : ''}`}
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-stone-600 rounded-full font-semibold text-sm hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
