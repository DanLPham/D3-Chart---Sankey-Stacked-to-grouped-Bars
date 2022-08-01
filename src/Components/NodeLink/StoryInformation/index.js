import React, { useState, useEffect } from "react";

const StoryInformation = ({ width, height, storyInfo, ...rest }) => {
  useEffect(() => {
    // console.log("storyInfo:", storyInfo);
  }, [storyInfo]);

  const field_name_width = 150 + 'px';
  const subfield_margin_left = 30 + 'px';
  const text_color = '#1E757F';

  const bg_color = "rgba('" + storyInfo.color + "', 0.5)";

  return (
    <div style={{ backgroundColor: bg_color, width: '100%', height: '100%', }}>
      <div style={{ padding: '10px 15px', }}>
        {storyInfo.totalViews ?
          <div>
            <a href="#">
              <img src={storyInfo.imgSrc} width='100%' height='80px' style={{ objectFit: 'cover' }} />
            </a>
            <div style={{ height: '10px', backgroundColor: storyInfo.color, }} />
            <div style={{ height: '10px', }} />
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: storyInfo.color,
            }}>
              {storyInfo.title}
            </div>
            <div style={{ height: '3px', }} />
            <a href="#">
              <button style={{
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#599EA4',
                color: "white",
                padding: '8px 14px',
                textAlign: 'center',
                display: 'inline-block',
                fontSize: '14px',
                margin: '4px 2px',
                cursor: 'pointer',
              }}>
                read this story
              </button>
            </a>
            <div style={{ height: '5px', }} />
            <div>
              <div style={{ fontWeight: 'bold', color: text_color, display: 'inline-block', width: field_name_width, }}>Author:</div>
              <div style={{ display: 'inline-block', }}>{storyInfo.author}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: text_color, display: 'inline-block', width: field_name_width, }}>Total views:</div>
              <div style={{ display: 'inline-block', }}>{storyInfo.totalViews}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: text_color, display: 'inline-block', width: field_name_width, }}>Created at:</div>
              <div style={{ display: 'inline-block', }}>{storyInfo.createdAt}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: text_color, display: 'inline-block', width: field_name_width, }}>Keywords:</div>
              <div style={{ display: 'inline-block', }}>{storyInfo.keywords.join(', ')}</div>
            </div>

            <div>
              <div style={{ fontWeight: 'bold', color: text_color, display: 'inline-block', width: field_name_width, }}>Influence score:</div>
              <div style={{ display: 'inline-block', }}>{storyInfo.influenceScore}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: text_color, display: 'inline-block', width: field_name_width, marginLeft: subfield_margin_left, }}>GKR similarity score:</div>
              <div style={{ display: 'inline-block', }}>{storyInfo.gkrSimilarityScore}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: text_color, display: 'inline-block', width: field_name_width, marginLeft: subfield_margin_left, }}>Contributing views:</div>
              <div style={{ display: 'inline-block', }}>{storyInfo.contributingViews}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: text_color, display: 'inline-block', width: field_name_width, marginLeft: subfield_margin_left, }}>Received views:</div>
              <div style={{ display: 'inline-block', }}>{storyInfo.receivedViews}</div>
            </div>
          </div>
          : <div style={{ color: text_color, fontWeight: 'bold', fontSize: '1rem', }}>Hover on one story to see further information</div>
        }
      </div>
    </div>
  );
}

export default StoryInformation;
