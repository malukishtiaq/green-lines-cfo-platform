// Regional Map Component for Clients by Region
import React from 'react';
import { Tooltip } from 'antd';

interface RegionData {
  region: string;
  count: number;
  countries?: Array<{ country: string; count: number }>;
}

interface RegionalMapProps {
  data: RegionData[];
}

const RegionalMap: React.FC<RegionalMapProps> = ({ data }) => {
  // Get max value for color scaling
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  // Get color intensity based on count
  const getColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return '#1890ff'; // Dark blue
    if (intensity > 0.5) return '#40a9ff'; // Medium blue
    if (intensity > 0.3) return '#69c0ff'; // Light blue
    return '#bae7ff'; // Very light blue
  };

  // Get region data by name
  const getRegionData = (regionName: string) => {
    return data.find(d => d.region === regionName) || { region: regionName, count: 0 };
  };

  const gccData = getRegionData('GCC');
  const menaData = getRegionData('MENA');
  const apacData = getRegionData('APAC');
  const euData = getRegionData('EU');

  const renderTooltipContent = (regionData: RegionData) => {
    if (regionData.count === 0) return `${regionData.region}: No clients`;
    
    let content = `${regionData.region}: ${regionData.count} clients`;
    if (regionData.countries && regionData.countries.length > 0) {
      content += '\n\nTop Countries:\n';
      regionData.countries.slice(0, 3).forEach(c => {
        content += `• ${c.country}: ${c.count}\n`;
      });
    }
    return content;
  };

  return (
    <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 800 400" style={{ width: '100%', maxWidth: '800px', height: 'auto' }}>
        {/* Background */}
        <rect width="800" height="400" fill="#f5f5f5" />
        
        {/* GCC Region (Middle East) */}
        <Tooltip title={renderTooltipContent(gccData)}>
          <g>
            <rect
              x="350"
              y="180"
              width="100"
              height="80"
              fill={getColor(gccData.count)}
              stroke="#fff"
              strokeWidth="2"
              rx="5"
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              className="region-hover"
            />
            <text
              x="400"
              y="210"
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="bold"
            >
              GCC
            </text>
            <text
              x="400"
              y="230"
              textAnchor="middle"
              fill="#fff"
              fontSize="20"
              fontWeight="bold"
            >
              {gccData.count}
            </text>
            <text
              x="400"
              y="248"
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
            >
              clients
            </text>
          </g>
        </Tooltip>

        {/* MENA Region (North Africa + Middle East) */}
        <Tooltip title={renderTooltipContent(menaData)}>
          <g>
            <rect
              x="250"
              y="180"
              width="90"
              height="80"
              fill={getColor(menaData.count)}
              stroke="#fff"
              strokeWidth="2"
              rx="5"
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              className="region-hover"
            />
            <text
              x="295"
              y="210"
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="bold"
            >
              MENA
            </text>
            <text
              x="295"
              y="230"
              textAnchor="middle"
              fill="#fff"
              fontSize="20"
              fontWeight="bold"
            >
              {menaData.count}
            </text>
            <text
              x="295"
              y="248"
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
            >
              clients
            </text>
          </g>
        </Tooltip>

        {/* APAC Region (Asia Pacific) */}
        <Tooltip title={renderTooltipContent(apacData)}>
          <g>
            <rect
              x="470"
              y="180"
              width="100"
              height="80"
              fill={getColor(apacData.count)}
              stroke="#fff"
              strokeWidth="2"
              rx="5"
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              className="region-hover"
            />
            <text
              x="520"
              y="210"
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="bold"
            >
              APAC
            </text>
            <text
              x="520"
              y="230"
              textAnchor="middle"
              fill="#fff"
              fontSize="20"
              fontWeight="bold"
            >
              {apacData.count}
            </text>
            <text
              x="520"
              y="248"
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
            >
              clients
            </text>
          </g>
        </Tooltip>

        {/* EU Region (Europe) */}
        <Tooltip title={renderTooltipContent(euData)}>
          <g>
            <rect
              x="150"
              y="140"
              width="90"
              height="80"
              fill={getColor(euData.count)}
              stroke="#fff"
              strokeWidth="2"
              rx="5"
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              className="region-hover"
            />
            <text
              x="195"
              y="170"
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="bold"
            >
              EU
            </text>
            <text
              x="195"
              y="190"
              textAnchor="middle"
              fill="#fff"
              fontSize="20"
              fontWeight="bold"
            >
              {euData.count}
            </text>
            <text
              x="195"
              y="208"
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
            >
              clients
            </text>
          </g>
        </Tooltip>

        {/* Legend */}
        <g transform="translate(620, 20)">
          <text x="0" y="0" fontSize="12" fontWeight="bold" fill="#666">
            Client Density
          </text>
          <rect x="0" y="10" width="30" height="15" fill="#1890ff" rx="2" />
          <text x="35" y="22" fontSize="11" fill="#666">High</text>
          
          <rect x="0" y="30" width="30" height="15" fill="#40a9ff" rx="2" />
          <text x="35" y="42" fontSize="11" fill="#666">Medium</text>
          
          <rect x="0" y="50" width="30" height="15" fill="#69c0ff" rx="2" />
          <text x="35" y="62" fontSize="11" fill="#666">Low</text>
          
          <rect x="0" y="70" width="30" height="15" fill="#bae7ff" rx="2" />
          <text x="35" y="82" fontSize="11" fill="#666">Very Low</text>
        </g>

        {/* Title */}
        <text x="400" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#333">
          Global Client Distribution
        </text>
      </svg>

      {/* CSS for hover effect */}
      <style jsx>{`
        .region-hover:hover {
          opacity: 0.8;
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default RegionalMap;

