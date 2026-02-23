import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { CostData } from '../../types';
import { useLanguage } from '../../lib/i18n';

const SOURCE_COLORS: Record<string, string> = {
  solar:           '#F59E0B',
  onshore_wind:    '#22C55E',
  natural_gas:     '#6B7280',
  nuclear_fission: '#8B5CF6',
  fusion:          '#3B82F6',
};

const SOURCE_LABELS: Record<string, { zh: string; en: string }> = {
  solar:           { zh: '太阳能',   en: 'Solar' },
  onshore_wind:    { zh: '陆上风电', en: 'Onshore Wind' },
  natural_gas:     { zh: '天然气',   en: 'Natural Gas' },
  nuclear_fission: { zh: '核裂变',   en: 'Nuclear Fission' },
  fusion:          { zh: '核聚变',   en: 'Fusion' },
};

interface Props {
  data: CostData[];
  selectedYear: number;
}

export default function LCOEChart({ data, selectedYear }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const el = svgRef.current;
    const W = el.clientWidth || 700;
    const H = 380;
    const margin = { top: 20, right: 40, bottom: 50, left: 60 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    d3.select(el).selectAll('*').remove();

    const svg = d3
      .select(el)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sources = [...new Set(data.map((d) => d.energy_source))];
    const allYears = [...new Set(data.map((d) => d.year))].sort();

    const x = d3.scaleLinear().domain(d3.extent(allYears) as [number, number]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 400]).range([h, 0]).nice();

    // Grid lines
    svg.append('g')
      .attr('stroke', 'rgba(0,0,0,0.05)')
      .attr('stroke-dasharray', '3,3')
      .call(d3.axisLeft(y).tickSize(-w).tickFormat(() => ''))
      .select('.domain').remove();

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat((d) => String(d)).ticks(8))
      .select('.domain').attr('stroke', 'rgba(0,0,0,0.1)');

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(6).tickFormat((d) => `$${d}`))
      .select('.domain').remove();

    // Y label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -h / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6B7280')
      .attr('font-size', 11)
      .text('$/MWh (LCOE)');

    // Draw lines and bands per source
    for (const source of sources) {
      const srcData = data.filter((d) => d.energy_source === source).sort((a, b) => a.year - b.year);
      const color = SOURCE_COLORS[source] ?? '#666';

      // Area band (uncertainty)
      const area = d3.area<CostData>()
        .defined((d) => d.lcoe_low != null && d.lcoe_high != null)
        .x((d) => x(d.year))
        .y0((d) => y(d.lcoe_low!))
        .y1((d) => y(d.lcoe_high!))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(srcData)
        .attr('fill', color)
        .attr('opacity', 0.1)
        .attr('d', area);

      // Line
      const line = d3.line<CostData>()
        .defined((d) => d.lcoe_median != null)
        .x((d) => x(d.year))
        .y((d) => y(d.lcoe_median!))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(srcData)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', srcData[0]?.is_projection ? '6,3' : 'none')
        .attr('d', line);
    }

    // Selected year vertical line
    svg.append('line')
      .attr('x1', x(selectedYear))
      .attr('x2', x(selectedYear))
      .attr('y1', 0)
      .attr('y2', h)
      .attr('stroke', 'rgba(0,0,0,0.3)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,2');

    svg.append('text')
      .attr('x', x(selectedYear) + 4)
      .attr('y', 12)
      .attr('font-size', 11)
      .attr('fill', '#1A1A2E')
      .text(selectedYear);

  }, [data, selectedYear, lang]);

  return (
    <div>
      <svg ref={svgRef} className="w-full" style={{ height: 380 }} />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {Object.entries(SOURCE_LABELS).map(([src, label]) => (
          <div key={src} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="w-6 h-0.5 inline-block"
              style={{ backgroundColor: SOURCE_COLORS[src] ?? '#666' }}
            />
            {lang === 'zh' ? label.zh : label.en}
          </div>
        ))}
      </div>
    </div>
  );
}
