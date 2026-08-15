"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function normalizeFeatures(rawFeatures: any) {
  if (!rawFeatures) return [{ title: '', image: '', description: '' }]
  let list = rawFeatures
  if (typeof rawFeatures === 'string') {
    try { list = JSON.parse(rawFeatures) } catch(e) { list = [] }
  }
  if (!Array.isArray(list)) list = []
  if (list.length === 0) return [{ title: '', image: '', description: '' }]

  return list.map((item: any) => {
    if (typeof item === 'string') {
      return { title: item, image: '', description: '' }
    }
    if (item && typeof item === 'object') {
      return {
        title: String(item.title || item.name || ''),
        image: String(item.image || item.imageUrl || ''),
        description: String(item.description || item.desc || '')
      }
    }
    return { title: '', image: '', description: '' }
  })
}

function normalizeSpecs(rawSpecs: any) {
  if (!rawSpecs) return [{ key: '', value: '', description: '' }]
  let parsed = rawSpecs
  if (typeof rawSpecs === 'string') {
    try { parsed = JSON.parse(rawSpecs) } catch(e) { parsed = [] }
  }
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return [{ key: '', value: '', description: '' }]
    return parsed.map((item: any) => ({
      key: String(item.key || ''),
      value: String(item.value || ''),
      description: String(item.description || '')
    }))
  }
  if (parsed && typeof parsed === 'object') {
    const entries = Object.entries(parsed)
    if (entries.length === 0) return [{ key: '', value: '', description: '' }]
    return entries.map(([key, value]) => ({
      key,
      value: String(value || ''),
      description: ''
    }))
  }
  return [{ key: '', value: '', description: '' }]
}

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: product.title,
    series: product.series,
    description: product.description,
    imageUrl: product.imageUrl || '',
    published: product.published,
    features: normalizeFeatures(product.features),
    specs: normalizeSpecs(product.specs),
    variants: product.variants.map((v: any) => {
      const parsedFeatures = normalizeFeatures(v.features);
      const parsedImages = v.images ? JSON.parse(v.images) : [''];
      const parsedSpecsArr = normalizeSpecs(v.specs);

      return {
        ...v,
        price: v.price,
        isOnSale: v.isOnSale ?? false,
        features: parsedFeatures,
        images: parsedImages.length > 0 ? parsedImages : [''],
        specs: parsedSpecsArr
      }
    })
  })

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setUploadingImage(true)
    const data = new FormData()
    data.append('file', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      })
      if (res.ok) {
        const json = await res.json()
        return json.url
      }
      alert('Image upload failed')
      return null
    } catch (e) {
      alert('Image upload failed')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const payload = {
      ...formData,
      features: formData.features
        .filter((f: any) => (f.title || '').trim() !== '')
        .map((f: any) => ({
          title: f.title.trim(),
          image: (f.image || '').trim(),
          description: (f.description || '').trim()
        })),
      specs: formData.specs.filter((curr: any) => curr.key.trim() !== ''),
      variants: formData.variants.map((v: any) => ({
        ...v,
        features: v.features
          .filter((f: any) => (f.title || '').trim() !== '')
          .map((f: any) => ({
            title: f.title.trim(),
            image: (f.image || '').trim(),
            description: (f.description || '').trim()
          })),
        images: v.images.filter((img: string) => img.trim() !== ''),
        specs: v.specs.filter((curr: any) => curr.key.trim() !== '')
      }))
    }

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        alert("Product updated successfully")
        router.refresh()
      } else {
        const errorJson = await res.json().catch(() => ({}))
        alert(`Failed to update product: ${errorJson.message || res.statusText || 'Server Error'}`)
      }
    } catch (err: any) {
      alert(`Error submitting form: ${err?.message || 'Network error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin')
      } else {
        alert("Failed to delete product")
      }
    } catch (err) {
      alert("Error deleting product")
    } finally {
      setLoading(false)
    }
  }

  const handleVariantPriceChange = (index: number, field: 'mrp' | 'discountPct' | 'price', value: number) => {
    const newV = [...formData.variants]
    let mrp = field === 'mrp' ? value : newV[index].mrp
    let discountPct = field === 'discountPct' ? value : newV[index].discountPct
    let price = field === 'price' ? value : newV[index].price

    if (field === 'mrp' || field === 'discountPct') {
      price = mrp - (mrp * discountPct / 100)
    } else if (field === 'price') {
      if (mrp > 0) {
        discountPct = Math.round(((mrp - price) / mrp) * 100)
      }
    }

    newV[index] = { ...newV[index], mrp, discountPct, price }
    setFormData({ ...formData, variants: newV })
  }


  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* SECTION 1: CORE DETAILS */}
      <div className="premium-card" style={{ padding: '30px' }}>
        <h2 className="text-gold" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>1. Core Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Product Title</label>
            <input type="text" className="form-input" required 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Series Classification</label>
            <select className="form-input" value={formData.series} onChange={e => setFormData({...formData, series: e.target.value})}>
              <option value="C-CLASS">C-CLASS</option>
              <option value="A-CLASS">A-CLASS</option>
              <option value="G-CLASS">G-CLASS</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Main Description</label>
            <textarea className="form-input" required rows={3}
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Main Image URL</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" className="form-input" placeholder="https://example.com/image.jpg or /uploads/..."
                value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={{ flex: 1 }} />
              <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {uploadingImage ? 'Uploading...' : 'Upload Device File'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = await handleImageUpload(e.target.files[0])
                    if (url) setFormData({...formData, imageUrl: url})
                  }
                }} />
              </label>
            </div>
            {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" style={{ marginTop: '10px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />}
          </div>
        </div>
      </div>

      {/* SECTION 2: BASE SPECS */}
      <div className="premium-card" style={{ padding: '30px' }}>
        <h2 className="text-gold" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>2. Base Specifications & Highlights</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>These apply universally to all variants unless specifically overridden.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Features */}
          <div>
            <label className="form-label text-gold" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Base Highlights / Key Features</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Title, Description & Image Attachment</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              {formData.features.map((feat: any, fIndex: number) => (
                <div key={fIndex} style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '12px', 
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Feature Title (e.g. Cloud OS 9.0)"
                      value={feat.title || ''} 
                      onChange={e => {
                        const newF = [...formData.features];
                        newF[fIndex] = { ...newF[fIndex], title: e.target.value };
                        setFormData({ ...formData, features: newF });
                      }} 
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newF = formData.features.filter((_: any, idx: number) => idx !== fIndex);
                        setFormData({ ...formData, features: newF });
                      }} 
                      style={{ background: 'rgba(255,77,77,0.15)', border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Info Explanation / Description (e.g. Fast cloud OS streaming apps without lag)"
                    value={feat.description || ''} 
                    onChange={e => {
                      const newF = [...formData.features];
                      newF[fIndex] = { ...newF[fIndex], description: e.target.value };
                      setFormData({ ...formData, features: newF });
                    }} 
                  />

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Feature Image URL (optional)" 
                      value={feat.image || ''} 
                      onChange={e => {
                        const newF = [...formData.features];
                        newF[fIndex] = { ...newF[fIndex], image: e.target.value };
                        setFormData({ ...formData, features: newF });
                      }}
                      style={{ flex: 1 }}
                    />
                    <label className="btn-secondary" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                      📷 Attach Image
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const url = await handleImageUpload(e.target.files[0])
                          if (url) {
                            const newF = [...formData.features];
                            newF[fIndex] = { ...newF[fIndex], image: url };
                            setFormData({ ...formData, features: newF });
                          }
                        }
                      }} />
                    </label>
                  </div>

                  {feat.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={feat.image} alt="Feature Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>✓ Image Attached</span>
                    </div>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => {
                  setFormData({ ...formData, features: [...formData.features, { title: '', image: '', description: '' }] });
                }} 
                className="btn-secondary" 
                style={{ fontSize: '0.82rem', padding: '8px 14px', alignSelf: 'flex-start' }}
              >
                + Add Base Highlight
              </button>
            </div>
          </div>

          {/* Specs */}
          <div>
            <label className="form-label text-gold" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Base Technical Specs</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Key, Value & (i) Info Popup Text</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {formData.specs.map((spec: any, sIndex: number) => (
                <div key={sIndex} style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '10px', 
                  padding: '12px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px' 
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" className="form-input" placeholder="Key (e.g. Resolution)"
                      value={spec.key || ''} onChange={e => {
                        const newS = [...formData.specs];
                        newS[sIndex] = { ...newS[sIndex], key: e.target.value };
                        setFormData({...formData, specs: newS})
                      }} style={{ flex: 1 }} />
                    <input type="text" className="form-input" placeholder="Value (e.g. 4K Ultra HD)"
                      value={spec.value || ''} onChange={e => {
                        const newS = [...formData.specs];
                        newS[sIndex] = { ...newS[sIndex], value: e.target.value };
                        setFormData({...formData, specs: newS})
                      }} style={{ flex: 1 }} />
                    <button type="button" onClick={() => {
                      const newS = formData.specs.filter((_: any, idx: number) => idx !== sIndex);
                      setFormData({...formData, specs: newS})
                    }} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  </div>

                  <input type="text" className="form-input" placeholder="ℹ️ (i) Info Popup Explanation (e.g. 3840 x 2160 pixels providing 4x clarity)"
                    value={spec.description || ''} onChange={e => {
                      const newS = [...formData.specs];
                      newS[sIndex] = { ...newS[sIndex], description: e.target.value };
                      setFormData({...formData, specs: newS})
                    }} />
                </div>
              ))}
              <button type="button" onClick={() => {
                setFormData({...formData, specs: [...formData.specs, { key: '', value: '', description: '' }]})
              }} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 14px', alignSelf: 'flex-start' }}>+ Add Base Spec</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* SECTION 3: VARIANTS */}
      <div className="premium-card" style={{ padding: '30px' }}>
        <h2 className="text-gold" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>3. Variant Models & Pricing Engine</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {formData.variants.map((v: any, i: number) => (
            <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
              <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Variant: {v.name || 'Untitled'}</h4>
                {formData.variants.length > 1 && (
                  <button type="button" onClick={() => {
                    const newV = formData.variants.filter((_: any, idx: number) => idx !== i);
                    setFormData({...formData, variants: newV})
                  }} style={{ color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}>Remove Variant</button>
                )}
              </div>
              
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Pricing row */}
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Model Name</label>
                    <input type="text" className="form-input" placeholder="e.g. 32 inch 512MB" required
                      value={v.name} onChange={e => {
                        const newV = [...formData.variants]; newV[i].name = e.target.value; setFormData({...formData, variants: newV})
                      }} />
                  </div>
                  <div style={{ width: '120px' }}>
                    <label className="form-label">MRP ₹</label>
                    <input type="number" className="form-input" required
                      value={v.mrp || ''} onChange={e => handleVariantPriceChange(i, 'mrp', Number(e.target.value))} />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label className="form-label">Discount %</label>
                    <input type="number" className="form-input" required
                      value={v.discountPct || ''} onChange={e => handleVariantPriceChange(i, 'discountPct', Number(e.target.value))} />
                  </div>
                  <div style={{ width: '140px' }}>
                    <label className="form-label text-cyan">Final Price ₹</label>
                    <input type="number" className="form-input" required style={{ borderColor: 'var(--accent-cyan)' }}
                      value={v.price || ''} onChange={e => handleVariantPriceChange(i, 'price', Number(e.target.value))} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ff7700', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      <input type="checkbox" checked={v.isOnSale || false} onChange={e => {
                        const newV = [...formData.variants];
                        newV[i].isOnSale = e.target.checked;
                        setFormData({...formData, variants: newV});
                      }} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      🔥 ON SALE
                    </label>
                  </div>
                </div>

                {/* SKU, Barcode & Stock Units Row */}
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label text-cyan">SKU Code (optional)</label>
                    <input type="text" className="form-input" placeholder="e.g. HOI-C-43-1GB"
                      value={v.sku || ''} onChange={e => {
                        const newV = [...formData.variants]; newV[i].sku = e.target.value; setFormData({...formData, variants: newV})
                      }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label text-gold">Barcode / EAN (for barcode scanner software)</label>
                    <input type="text" className="form-input" placeholder="Scan or type barcode e.g. 8901234567890"
                      value={v.barcode || ''} onChange={e => {
                        const newV = [...formData.variants]; newV[i].barcode = e.target.value; setFormData({...formData, variants: newV})
                      }} />
                  </div>
                  <div style={{ width: '130px' }}>
                    <label className="form-label">Stock Units</label>
                    <input type="number" className="form-input" placeholder="10"
                      value={v.stockQuantity ?? 10} onChange={e => {
                        const newV = [...formData.variants]; newV[i].stockQuantity = Number(e.target.value); setFormData({...formData, variants: newV})
                      }} />
                  </div>
                </div>

                <hr style={{ borderColor: 'var(--border-color)', margin: '0' }} />

                {/* Images & Details Split */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  
                  {/* Left side: Images & Highlights */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label className="form-label text-cyan">Variant Images (Gallery)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {v.images.map((img: string, imgIndex: number) => (
                          <div key={imgIndex} style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" className="form-input" placeholder="Image URL or /uploads/..."
                              value={img} onChange={e => {
                                const newV = [...formData.variants];
                                newV[i].images[imgIndex] = e.target.value;
                                setFormData({...formData, variants: newV})
                              }} style={{ flex: 1 }} />
                            <label className="btn-secondary" style={{ cursor: 'pointer', padding: '8px', fontSize: '0.8rem' }}>
                              Upload
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const url = await handleImageUpload(e.target.files[0])
                                  if (url) {
                                    const newV = [...formData.variants];
                                    newV[i].images[imgIndex] = url;
                                    setFormData({...formData, variants: newV})
                                  }
                                }
                              }} />
                            </label>
                            <button type="button" onClick={() => {
                              const newV = [...formData.variants];
                              newV[i].images = newV[i].images.filter((_: any, idx: number) => idx !== imgIndex);
                              setFormData({...formData, variants: newV})
                            }} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>X</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const newV = [...formData.variants];
                          newV[i].images.push('');
                          setFormData({...formData, variants: newV})
                        }} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 10px', alignSelf: 'flex-start' }}>+ Add Image</button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label text-gold">Variant Highlights (Overrides Base)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {v.features.map((feat: any, fIndex: number) => (
                          <div key={fIndex} style={{ 
                            background: 'rgba(0,0,0,0.3)', 
                            border: '1px solid rgba(255,255,255,0.08)', 
                            borderRadius: '10px', 
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Highlight Title"
                                value={feat.title || ''} 
                                onChange={e => {
                                  const newV = [...formData.variants];
                                  newV[i].features[fIndex] = { ...newV[i].features[fIndex], title: e.target.value };
                                  setFormData({ ...formData, variants: newV });
                                }} 
                                style={{ flex: 1 }}
                              />
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newV = [...formData.variants];
                                  newV[i].features = newV[i].features.filter((_: any, idx: number) => idx !== fIndex);
                                  setFormData({ ...formData, variants: newV });
                                }} 
                                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                ✕
                              </button>
                            </div>
                            
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Explanation / Description (optional)"
                              value={feat.description || ''} 
                              onChange={e => {
                                const newV = [...formData.variants];
                                newV[i].features[fIndex] = { ...newV[i].features[fIndex], description: e.target.value };
                                setFormData({ ...formData, variants: newV });
                              }} 
                            />

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Image URL (optional)" 
                                value={feat.image || ''} 
                                onChange={e => {
                                  const newV = [...formData.variants];
                                  newV[i].features[fIndex] = { ...newV[i].features[fIndex], image: e.target.value };
                                  setFormData({ ...formData, variants: newV });
                                }}
                                style={{ flex: 1 }}
                              />
                              <label className="btn-secondary" style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '5px 10px', whiteSpace: 'nowrap' }}>
                                📷 Upload
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const url = await handleImageUpload(e.target.files[0])
                                    if (url) {
                                      const newV = [...formData.variants];
                                      newV[i].features[fIndex] = { ...newV[i].features[fIndex], image: url };
                                      setFormData({ ...formData, variants: newV });
                                    }
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const newV = [...formData.variants];
                          newV[i].features.push({ title: '', image: '', description: '' });
                          setFormData({...formData, variants: newV})
                        }} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 10px', alignSelf: 'flex-start' }}>+ Add Highlight</button>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Smart Specs UI */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label className="form-label text-gold" style={{ margin: 0 }}>Variant Specifications</label>
                    </div>
                    
                    {/* Editable Base Specs */}
                    {formData.specs.filter((bs: any) => bs.key.trim() !== '').length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Base specifications (Edit to override for this variant)</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {formData.specs.filter((bs: any) => bs.key.trim() !== '').map((bs: any, bsIdx: number) => {
                            const variantSpecIndex = v.specs.findIndex((vs: any) => vs.key.trim().toLowerCase() === bs.key.trim().toLowerCase() && vs.key.trim() !== '')
                            const isOverridden = variantSpecIndex !== -1
                            const isRemoved = isOverridden && v.specs[variantSpecIndex].value === '__REMOVED__'
                            const displayValue = isRemoved ? '' : (isOverridden ? v.specs[variantSpecIndex].value : bs.value)

                            return (
                              <div key={bsIdx} style={{ display: 'flex', gap: '10px', opacity: isRemoved ? 0.4 : 1 }}>
                                <input type="text" className="form-input" disabled value={bs.key} 
                                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', textDecoration: isRemoved ? 'line-through' : 'none' }} />
                                <input type="text" className="form-input" 
                                  value={displayValue} 
                                  disabled={isRemoved}
                                  placeholder={isRemoved ? "Removed from this variant" : ""}
                                  onChange={e => {
                                    const newV = [...formData.variants]
                                    if (isOverridden) {
                                      newV[i].specs[variantSpecIndex].value = e.target.value
                                    } else {
                                      newV[i].specs.push({ key: bs.key, value: e.target.value, description: bs.description || '' })
                                    }
                                    setFormData({...formData, variants: newV})
                                  }} 
                                  style={{ flex: 1, borderColor: isOverridden && !isRemoved ? 'var(--accent-cyan)' : 'var(--border-color)' }} 
                                />
                                {isRemoved ? (
                                   <button type="button" onClick={() => {
                                      const newV = [...formData.variants]
                                      newV[i].specs = newV[i].specs.filter((_: any, idx: number) => idx !== variantSpecIndex)
                                      setFormData({...formData, variants: newV})
                                   }} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', width: '30px', fontSize: '0.8rem' }} title="Restore base spec">↻</button>
                                ) : isOverridden ? (
                                  <div style={{ display: 'flex', width: '40px', justifyContent: 'space-between' }}>
                                    <button type="button" onClick={() => {
                                      const newV = [...formData.variants]
                                      newV[i].specs = newV[i].specs.filter((_: any, idx: number) => idx !== variantSpecIndex)
                                      setFormData({...formData, variants: newV})
                                    }} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }} title="Revert to base">↺</button>
                                    <button type="button" onClick={() => {
                                      const newV = [...formData.variants]
                                      newV[i].specs[variantSpecIndex].value = '__REMOVED__'
                                      setFormData({...formData, variants: newV})
                                    }} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }} title="Delete completely">X</button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', width: '40px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => {
                                      const newV = [...formData.variants]
                                      newV[i].specs.push({ key: bs.key, value: '__REMOVED__', description: '' })
                                      setFormData({...formData, variants: newV})
                                    }} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }} title="Delete completely">X</button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Additional Variant-Only Specs */}
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Additional specs unique to this variant</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {v.specs.filter((vs: any) => !formData.specs.some((bs: any) => bs.key.trim().toLowerCase() === vs.key.trim().toLowerCase() && bs.key.trim() !== '')).map((spec: any, sIndex: number) => {
                          const originalIndex = v.specs.indexOf(spec)
                          return (
                            <div key={originalIndex} style={{ display: 'flex', gap: '10px' }}>
                              <input type="text" className="form-input" placeholder="Key (e.g. Stand Type)"
                                value={spec.key} onChange={e => {
                                  const newV = [...formData.variants];
                                  newV[i].specs[originalIndex].key = e.target.value;
                                  setFormData({...formData, variants: newV})
                                }} style={{ flex: 1, borderColor: 'var(--accent-cyan)' }} />
                              <input type="text" className="form-input" placeholder="Value"
                                value={spec.value} onChange={e => {
                                  const newV = [...formData.variants];
                                  newV[i].specs[originalIndex].value = e.target.value;
                                  setFormData({...formData, variants: newV})
                                }} style={{ flex: 1 }} />
                              <button type="button" onClick={() => {
                                const newV = [...formData.variants];
                                newV[i].specs = newV[i].specs.filter((_: any, idx: number) => idx !== originalIndex);
                                setFormData({...formData, variants: newV})
                              }} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', width: '30px' }}>X</button>
                            </div>
                          )
                        })}
                        <button type="button" onClick={() => {
                          const newV = [...formData.variants];
                          newV[i].specs.push({ key: '', value: '', description: '' });
                          setFormData({...formData, variants: newV})
                        }} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 10px', alignSelf: 'flex-start' }}>+ Add Unique Spec</button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
          
          <button type="button" className="btn-primary" onClick={() => setFormData({...formData, variants: [...formData.variants, {name: '', mrp: 0, discountPct: 0, price: 0, isOnSale: false, features: [{ title: '', image: '', description: '' }], images: [''], specs: [{key: '', value: '', description: ''}]}]})} style={{ padding: '15px', borderStyle: 'dashed' }}>
            + Add Another Variant
          </button>
        </div>
      </div>

      <div className="premium-card" style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input type="checkbox" id="published" checked={formData.published} 
            onChange={e => setFormData({...formData, published: e.target.checked})} style={{ width: '20px', height: '20px' }} />
          <label htmlFor="published" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', cursor: 'pointer' }}>Published to Storefront</label>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <button type="button" onClick={handleDelete} className="btn-secondary" style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }} disabled={loading}>
            Delete Product
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '15px 40px', fontSize: '1.2rem' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

    </form>
  )
}
