import { useMemo, useState } from 'react'
import SectionHeading from '../components/SectionHeading'

function TrackerPage({ species, trackerMetrics, liveData, loading, error }) {
  const [searchText, setSearchText] = useState('')
  const [filterRegion, setFilterRegion] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [filterRisk, setFilterRisk] = useState('All')
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportSuccess, setReportSuccess] = useState('')
  const [reportForm, setReportForm] = useState({
    speciesName: '',
    region: 'Ladakh',
    location: '',
    sightingDate: '',
    count: '',
    confidence: 'Medium',
    proofFileName: '',
    notes: '',
    reporterName: '',
    contact: '',
  })

  const regions = useMemo(() => ['All', ...new Set(species.map((item) => item.region))], [species])
  const types = useMemo(() => ['All', ...new Set(species.map((item) => item.type))], [species])

  const filteredSpecies = useMemo(() => {
    const needle = searchText.trim().toLowerCase()

    return species.filter((item) => {
      const byName =
        needle.length === 0 ||
        item.name.toLowerCase().includes(needle) ||
        item.scientificName.toLowerCase().includes(needle)
      const byRegion = filterRegion === 'All' || item.region === filterRegion
      const byType = filterType === 'All' || item.type === filterType
      const byRisk = filterRisk === 'All' || item.risk === filterRisk
      return byName && byRegion && byType && byRisk
    })
  }, [species, searchText, filterRegion, filterType, filterRisk])

  const gbifLookup = useMemo(() => {
    const table = new Map()
    liveData.gbif.forEach((item) => {
      table.set(item.scientificName, item.occurrenceCount)
    })
    return table
  }, [liveData])

  const trackerInsights = useMemo(() => {
    if (!filteredSpecies.length) {
      return {
        avgRetention: 0,
        criticalOrHigh: 0,
        topDecliners: [],
      }
    }

    const retentionValues = filteredSpecies.map((item) => Math.round((item.trend.at(-1) / item.trend[0]) * 100))
    const avgRetention = Math.round(
      retentionValues.reduce((sum, value) => sum + value, 0) / retentionValues.length,
    )

    const criticalOrHigh = filteredSpecies.filter((item) => ['Critical', 'High'].includes(item.risk)).length
    const topDecliners = filteredSpecies
      .map((item) => ({
        id: item.id,
        name: item.name,
        changePct: Math.round(((item.trend.at(-1) - item.trend[0]) / item.trend[0]) * 100),
      }))
      .sort((a, b) => a.changePct - b.changePct)
      .slice(0, 3)

    return {
      avgRetention,
      criticalOrHigh,
      topDecliners,
    }
  }, [filteredSpecies])

  function updateReportField(field, value) {
    setReportForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetReportForm() {
    setReportForm({
      speciesName: '',
      region: 'Ladakh',
      location: '',
      sightingDate: '',
      count: '',
      confidence: 'Medium',
      proofFileName: '',
      notes: '',
      reporterName: '',
      contact: '',
    })
  }

  function handleReportSubmit(event) {
    event.preventDefault()
    setReportSuccess(`Sighting reported for ${reportForm.speciesName || 'selected species'} in ${reportForm.region}.`)
    setIsReportOpen(false)
    resetReportForm()
  }

  return (
    <section className="page-panel">
      <SectionHeading
        title="Trees + Animals Tracker"
        subtitle="Population trajectories mixed with live biodiversity and forest indicators"
      />

      <div className="tracker-live-pill" role="status" aria-live="polite">
        <span className="live-dot" aria-hidden="true" />
        <span>LIVE data stream active</span>
      </div>

      <div className="tracker-controls glass">
        <label>
          Search
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Species name or scientific name"
          />
        </label>
        <label>
          Region
          <select value={filterRegion} onChange={(event) => setFilterRegion(event.target.value)}>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Risk
          <select value={filterRisk} onChange={(event) => setFilterRisk(event.target.value)}>
            <option>All</option>
            <option>Critical</option>
            <option>High</option>
            <option>Moderate</option>
          </select>
        </label>
      </div>

      <div className="tracker-brief glass">
        <article>
          <small>Mean Retention Across Tracked Species</small>
          <strong>{trackerInsights.avgRetention}%</strong>
          <p>% = current population versus baseline period in this tracker.</p>
        </article>
        <article>
          <small>High-Risk Profiles (Critical + High)</small>
          <strong>{trackerInsights.criticalOrHigh}</strong>
          <p>Count of species tagged as high exposure in the current dataset.</p>
        </article>
        <article>
          <small>Population Change Threshold</small>
          <strong>Below 90%</strong>
          <p>Any value below 90% indicates notable decline from baseline.</p>
        </article>
      </div>

      <div className="tracker-alerts glass">
        <h4>Most Rapid Declines</h4>
        <ul>
          {trackerInsights.topDecliners.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <strong>{item.changePct}%</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="tracker-metrics">
        <article className="metric glass">
          <h3>{trackerMetrics.animalCount}</h3>
          <p>Animal species tracked</p>
        </article>
        <article className="metric glass">
          <h3>{trackerMetrics.treeCount}</h3>
          <p>Tree species tracked</p>
        </article>
        <article className="metric glass">
          <h3>{trackerMetrics.decliningCount}</h3>
          <p>Total declining profiles</p>
        </article>
      </div>

      <div className="tracker-metrics">
        <article className="metric glass">
          <h3>{trackerMetrics.animalDecline}</h3>
          <p>Declining animals</p>
        </article>
        <article className="metric glass">
          <h3>{trackerMetrics.treeDecline}</h3>
          <p>Declining trees</p>
        </article>
        <article className="metric glass">
          <h3>{loading ? '...' : liveData.indicators?.threatenedPlants?.value ?? 'N/A'}</h3>
          <p>Threatened plant species in India</p>
        </article>
      </div>

      <div className="api-grid">
        <article className="glass api-card">
          <h4>World Bank Indicators</h4>
          {loading ? (
            <p>Loading live indicators...</p>
          ) : (
            <ul>
              <li>Forest area: {liveData.indicators?.forestAreaPct?.value?.toFixed(2) ?? 'N/A'}%</li>
              <li>Threatened mammals: {liveData.indicators?.threatenedMammals?.value ?? 'N/A'}</li>
              <li>Threatened birds: {liveData.indicators?.threatenedBirds?.value ?? 'N/A'}</li>
              <li>Threatened plants: {liveData.indicators?.threatenedPlants?.value ?? 'N/A'}</li>
            </ul>
          )}
        </article>

        <article className="glass api-card">
          <h4>GBIF Occurrence Snapshot (India)</h4>
          <ul>
            {species.slice(0, 6).map((item) => (
              <li key={item.id}>
                {item.name}: {loading ? '...' : gbifLookup.get(item.scientificName) ?? 'N/A'}
              </li>
            ))}
          </ul>
        </article>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="trend-list glass">
        <p className="trend-filter-count">Filtered species: {filteredSpecies.length}</p>
        <p className="trend-explainer">
          Each percentage shows latest population compared with its baseline sample: 100% means stable, lower values
          indicate decline, and higher values indicate recovery.
        </p>
        {filteredSpecies.map((item) => {
          const start = item.trend[0]
          const end = item.trend.at(-1)
          const pct = Math.round((end / start) * 100)
          return (
            <div key={item.id} className="trend-row">
              <div>
                <h4>{item.name}</h4>
                <small>
                  {item.region} - {item.type}
                </small>
              </div>
              <div className="bar-wrap">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <strong className={pct < 90 ? 'down' : 'up'}>{pct}%</strong>
            </div>
          )
        })}

        {filteredSpecies.length === 0 ? <p className="trend-empty">No species match these filters.</p> : null}
      </div>

      {reportSuccess ? <p className="report-feedback" role="status">{reportSuccess}</p> : null}

      <button
        type="button"
        className="report-sighting-btn"
        onClick={() => {
          setIsReportOpen(true)
          setReportSuccess('')
        }}
      >
        Report a Sighting
      </button>

      {isReportOpen ? (
        <div className="report-modal-backdrop" role="presentation" onClick={() => setIsReportOpen(false)}>
          <section
            className="report-modal glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-sighting-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="report-modal-head">
              <h3 id="report-sighting-title">Report a Sighting</h3>
              <button type="button" className="report-close-btn" onClick={() => setIsReportOpen(false)}>
                Close
              </button>
            </div>

            <form className="report-form" onSubmit={handleReportSubmit}>
              <label>
                Species Name
                <input
                  type="text"
                  value={reportForm.speciesName}
                  onChange={(event) => updateReportField('speciesName', event.target.value)}
                  placeholder="Snow Leopard"
                  required
                />
              </label>

              <label>
                Region
                <select value={reportForm.region} onChange={(event) => updateReportField('region', event.target.value)}>
                  {regions.filter((region) => region !== 'All').map((region) => (
                    <option key={region}>{region}</option>
                  ))}
                </select>
              </label>

              <label>
                Location Details
                <input
                  type="text"
                  value={reportForm.location}
                  onChange={(event) => updateReportField('location', event.target.value)}
                  placeholder="Village, trail, reserve, or coordinates"
                  required
                />
              </label>

              <label>
                Sighting Date
                <input
                  type="date"
                  value={reportForm.sightingDate}
                  onChange={(event) => updateReportField('sightingDate', event.target.value)}
                  required
                />
              </label>

              <label>
                Number Observed
                <input
                  type="number"
                  min="1"
                  value={reportForm.count}
                  onChange={(event) => updateReportField('count', event.target.value)}
                  placeholder="1"
                  required
                />
              </label>

              <label>
                Confidence
                <select
                  value={reportForm.confidence}
                  onChange={(event) => updateReportField('confidence', event.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>

              <label>
                Proof Upload
                <input
                  type="file"
                  accept="image/*,video/*,.pdf"
                  onChange={(event) =>
                    updateReportField('proofFileName', event.target.files?.[0]?.name ?? '')
                  }
                  required
                />
                {reportForm.proofFileName ? <small>Selected: {reportForm.proofFileName}</small> : null}
              </label>

              <label className="report-span-2">
                Notes
                <textarea
                  value={reportForm.notes}
                  onChange={(event) => updateReportField('notes', event.target.value)}
                  rows={3}
                  placeholder="Behavior, habitat, weather, or potential threats"
                />
              </label>

              <label>
                Reporter Name
                <input
                  type="text"
                  value={reportForm.reporterName}
                  onChange={(event) => updateReportField('reporterName', event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label>
                Contact (email/phone)
                <input
                  type="text"
                  value={reportForm.contact}
                  onChange={(event) => updateReportField('contact', event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <div className="report-actions report-span-2">
                <button type="button" className="ghost-btn" onClick={() => setIsReportOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="report-submit-btn">
                  Submit Report
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  )
}

export default TrackerPage
