import React, { useState } from 'react';
import './FavouritesComponent.css';

export default function FavouritesComponent(){
    return (
        <div className="profile-content">
          <h2>Favourites</h2>
          <div className="favourites-list">
            {[
              { name: 'Smartphone X', category: 'Electronics' },
              { name: 'Wireless Headphones', category: 'Audio' },
              { name: 'Smart Watch', category: 'Wearables' }
            ].map((item, index) => (
              <div key={index} className="favourites-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                </div>
                <button>Remove</button>
              </div>
            ))}
          </div>
        </div>
    );
}