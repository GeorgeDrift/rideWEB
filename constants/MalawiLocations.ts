
export interface Location {
    name: string;
    district: string;
    region: 'Northern' | 'Central' | 'Southern';
    type: 'City' | 'Town' | 'Boma' | 'Trading Centre' | 'Village' | 'Border Post' | 'Mission';
}

export const MALAWI_LOCATIONS: Location[] = [
    // NORTHERN REGION - CHITIPA DISTRICT
    { name: 'Chitipa Boma', district: 'Chitipa', region: 'Northern', type: 'Boma' },
    { name: 'Kamwezi', district: 'Chitipa', region: 'Northern', type: 'Trading Centre' },
    { name: 'Nthalire', district: 'Chitipa', region: 'Northern', type: 'Trading Centre' },
    { name: 'Wenya', district: 'Chitipa', region: 'Northern', type: 'Village' },
    { name: 'Misuku', district: 'Chitipa', region: 'Northern', type: 'Village' },
    { name: 'Kapenda', district: 'Chitipa', region: 'Northern', type: 'Village' },
    { name: 'Kasambala', district: 'Chitipa', region: 'Northern', type: 'Village' },
    { name: 'Ifumbo', district: 'Chitipa', region: 'Northern', type: 'Village' },
    { name: 'Ipenza', district: 'Chitipa', region: 'Northern', type: 'Village' },

    // NORTHERN REGION - KARONGA DISTRICT
    { name: 'Karonga Town', district: 'Karonga', region: 'Northern', type: 'Town' },
    { name: 'Chilumba', district: 'Karonga', region: 'Northern', type: 'Town' },
    { name: 'Kaporo', district: 'Karonga', region: 'Northern', type: 'Trading Centre' },
    { name: 'Nyungwe', district: 'Karonga', region: 'Northern', type: 'Village' },
    { name: 'Lupembe', district: 'Karonga', region: 'Northern', type: 'Village' },
    { name: 'Rukuru', district: 'Karonga', region: 'Northern', type: 'Village' },
    { name: 'Mwenilondo', district: 'Karonga', region: 'Northern', type: 'Village' },
    { name: 'Mwenitete', district: 'Karonga', region: 'Northern', type: 'Village' },
    { name: 'Songwe Border', district: 'Karonga', region: 'Northern', type: 'Border Post' },
    { name: 'Binga', district: 'Karonga', region: 'Northern', type: 'Village' },
    { name: 'Ngara', district: 'Karonga', region: 'Northern', type: 'Village' },

    // NORTHERN REGION - RUMPHI DISTRICT
    { name: 'Rumphi Boma', district: 'Rumphi', region: 'Northern', type: 'Boma' },
    { name: 'Mzokoto', district: 'Rumphi', region: 'Northern', type: 'Trading Centre' },
    { name: 'Bolero', district: 'Rumphi', region: 'Northern', type: 'Village' },
    { name: 'Hewe', district: 'Rumphi', region: 'Northern', type: 'Village' },
    { name: 'Livingstonia', district: 'Rumphi', region: 'Northern', type: 'Mission' },
    { name: 'Kondowe', district: 'Rumphi', region: 'Northern', type: 'Village' },
    { name: 'Chiweta', district: 'Rumphi', region: 'Northern', type: 'Trading Centre' },
    { name: 'Jalawe', district: 'Rumphi', region: 'Northern', type: 'Village' },
    { name: 'Mphompha', district: 'Rumphi', region: 'Northern', type: 'Village' },
    { name: 'Kamphenda', district: 'Rumphi', region: 'Northern', type: 'Village' },

    // NORTHERN REGION - MZIMBA DISTRICT
    { name: 'Mzimba Boma', district: 'Mzimba', region: 'Northern', type: 'Boma' },
    { name: 'Mzuzu City', district: 'Mzimba', region: 'Northern', type: 'City' },
    { name: 'Ekwendeni', district: 'Mzimba', region: 'Northern', type: 'Town' },
    { name: 'Embangweni', district: 'Mzimba', region: 'Northern', type: 'Town' },
    { name: 'Enukweni', district: 'Mzimba', region: 'Northern', type: 'Town' },
    { name: 'Mbalachanda', district: 'Mzimba', region: 'Northern', type: 'Trading Centre' },
    { name: 'Jenda', district: 'Mzimba', region: 'Northern', type: 'Trading Centre' },
    { name: 'Edingeni', district: 'Mzimba', region: 'Northern', type: 'Trading Centre' },
    { name: 'Euthini', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Mpherembe', district: 'Mzimba', region: 'Northern', type: 'Trading Centre' },
    { name: 'Manyamula', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Kafukule', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Luwinga', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Chiputula', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Katawa', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Chibanja', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Zolozolo', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Msongwe', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Dunduzu', district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: "Kaning'ina", district: 'Mzimba', region: 'Northern', type: 'Village' },
    { name: 'Luviri', district: 'Mzimba', region: 'Northern', type: 'Village' },

    // NORTHERN REGION - NKHATA BAY DISTRICT
    { name: 'Nkhata Bay Boma', district: 'Nkhata Bay', region: 'Northern', type: 'Boma' },
    { name: 'Dwangwa', district: 'Nkhata Bay', region: 'Northern', type: 'Town' },
    { name: 'Chintheche', district: 'Nkhata Bay', region: 'Northern', type: 'Trading Centre' },
    { name: 'Kande', district: 'Nkhata Bay', region: 'Northern', type: 'Village' },
    { name: 'Tukombo', district: 'Nkhata Bay', region: 'Northern', type: 'Village' },
    { name: 'Vizara', district: 'Nkhata Bay', region: 'Northern', type: 'Village' },
    { name: 'Usisya', district: 'Nkhata Bay', region: 'Northern', type: 'Village' },
    { name: 'Bula', district: 'Nkhata Bay', region: 'Northern', type: 'Village' },
    { name: 'Mpamba', district: 'Nkhata Bay', region: 'Northern', type: 'Village' },
    { name: 'Luwalika', district: 'Nkhata Bay', region: 'Northern', type: 'Village' },
    { name: 'Sanga', district: 'Nkhata Bay', region: 'Northern', type: 'Village' },

    // NORTHERN REGION - LIKOMA DISTRICT
    { name: 'Likoma Island', district: 'Likoma', region: 'Northern', type: 'Town' },
    { name: 'Chizumulu Island', district: 'Likoma', region: 'Northern', type: 'Village' },

    // CENTRAL REGION - NKHOTAKOTA DISTRICT
    { name: 'Nkhotakota Boma', district: 'Nkhotakota', region: 'Central', type: 'Boma' },
    { name: 'Benga', district: 'Nkhotakota', region: 'Central', type: 'Trading Centre' },
    { name: 'Mpamantha', district: 'Nkhotakota', region: 'Central', type: 'Village' },
    { name: 'Lozi', district: 'Nkhotakota', region: 'Central', type: 'Village' },
    { name: 'Kamboni', district: 'Nkhotakota', region: 'Central', type: 'Village' },
    { name: 'Mwansambo', district: 'Nkhotakota', region: 'Central', type: 'Village' },
    { name: 'Kasiya', district: 'Nkhotakota', region: 'Central', type: 'Village' },
    { name: 'Chia', district: 'Nkhotakota', region: 'Central', type: 'Village' },

    // CENTRAL REGION - KASUNGU DISTRICT
    { name: 'Kasungu Boma', district: 'Kasungu', region: 'Central', type: 'Boma' },
    { name: 'Santhe', district: 'Kasungu', region: 'Central', type: 'Trading Centre' },
    { name: 'Chinkhwiri', district: 'Kasungu', region: 'Central', type: 'Village' },
    { name: 'Chulu', district: 'Kasungu', region: 'Central', type: 'Village' },
    { name: 'Chamama', district: 'Kasungu', region: 'Central', type: 'Village' },
    { name: 'Bwabwa', district: 'Kasungu', region: 'Central', type: 'Village' },
    { name: 'Nkhamenya', district: 'Kasungu', region: 'Central', type: 'Village' },
    { name: 'Simlemba', district: 'Kasungu', region: 'Central', type: 'Village' },
    { name: 'Lisasadzi', district: 'Kasungu', region: 'Central', type: 'Village' },
    { name: 'Mkanakhoti', district: 'Kasungu', region: 'Central', type: 'Village' },

    // CENTRAL REGION - NTCHISI DISTRICT
    { name: 'Ntchisi Boma', district: 'Ntchisi', region: 'Central', type: 'Boma' },
    { name: 'Malomo', district: 'Ntchisi', region: 'Central', type: 'Village' },
    { name: 'Khuwi', district: 'Ntchisi', region: 'Central', type: 'Village' },
    { name: 'Mndinda', district: 'Ntchisi', region: 'Central', type: 'Village' },
    { name: 'Mpherere', district: 'Ntchisi', region: 'Central', type: 'Village' },

    // CENTRAL REGION - DOWA DISTRICT
    { name: 'Dowa Boma', district: 'Dowa', region: 'Central', type: 'Boma' },
    { name: 'Mponela', district: 'Dowa', region: 'Central', type: 'Town' },
    { name: 'Chezi', district: 'Dowa', region: 'Central', type: 'Trading Centre' },
    { name: 'Chankhungu', district: 'Dowa', region: 'Central', type: 'Village' },
    { name: 'Madisi', district: 'Dowa', region: 'Central', type: 'Village' },
    { name: 'Nsaru', district: 'Dowa', region: 'Central', type: 'Village' },
    { name: 'Mvera', district: 'Dowa', region: 'Central', type: 'Village' },
    { name: 'Dzaleka', district: 'Dowa', region: 'Central', type: 'Village' },
    { name: 'Nambuma', district: 'Dowa', region: 'Central', type: 'Village' },

    // CENTRAL REGION - LILONGWE DISTRICT
    { name: 'Lilongwe City', district: 'Lilongwe', region: 'Central', type: 'City' },
    { name: 'Area 1', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Area 2', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Area 3', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Area 4', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Area 18', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Area 25', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Area 47', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Area 49', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Old Town', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'City Centre', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Falls', district: 'Lilongwe', region: 'Central', type: 'Village' },
    { name: 'Kawale', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Chinsapo', district: 'Lilongwe', region: 'Central', type: 'Town' },
    { name: 'Likuni', district: 'Lilongwe', region: 'Central', type: 'Village' },
    { name: 'Mitundu', district: 'Lilongwe', region: 'Central', type: 'Trading Centre' },
    { name: 'Msundwe', district: 'Lilongwe', region: 'Central', type: 'Village' },
    { name: 'Malingunde', district: 'Lilongwe', region: 'Central', type: 'Village' },
    { name: 'Nkhoma', district: 'Lilongwe', region: 'Central', type: 'Mission' },
    { name: 'Chitedze', district: 'Lilongwe', region: 'Central', type: 'Village' },

    // CENTRAL REGION - MCHINJI DISTRICT
    { name: 'Mchinji Boma', district: 'Mchinji', region: 'Central', type: 'Boma' },
    { name: 'Mkanda', district: 'Mchinji', region: 'Central', type: 'Trading Centre' },
    { name: 'Kamwendo', district: 'Mchinji', region: 'Central', type: 'Border Post' },
    { name: 'Kapiri', district: 'Mchinji', region: 'Central', type: 'Village' },
    { name: 'Ludzi', district: 'Mchinji', region: 'Central', type: 'Village' },
    { name: 'Mavwere', district: 'Mchinji', region: 'Central', type: 'Village' },
    { name: 'Kachebere', district: 'Mchinji', region: 'Central', type: 'Village' },
    { name: 'Mponda', district: 'Mchinji', region: 'Central', type: 'Village' },

    // CENTRAL REGION - SALIMA DISTRICT
    { name: 'Salima Boma', district: 'Salima', region: 'Central', type: 'Boma' },
    { name: 'Chipoka', district: 'Salima', region: 'Central', type: 'Town' },
    { name: 'Lifuwu', district: 'Salima', region: 'Central', type: 'Village' },
    { name: 'Senga Bay', district: 'Salima', region: 'Central', type: 'Town' },
    { name: 'Tembwe', district: 'Salima', region: 'Central', type: 'Village' },
    { name: 'Chitala', district: 'Salima', region: 'Central', type: 'Village' },

    // CENTRAL REGION - DEDZA DISTRICT
    { name: 'Dedza Boma', district: 'Dedza', region: 'Central', type: 'Boma' },
    { name: 'Lobi', district: 'Dedza', region: 'Central', type: 'Trading Centre' },
    { name: 'Kaphuka', district: 'Dedza', region: 'Central', type: 'Village' },
    { name: 'Mayani', district: 'Dedza', region: 'Central', type: 'Village' },
    { name: 'Mtakataka', district: 'Dedza', region: 'Central', type: 'Village' },
    { name: 'Nsipe', district: 'Dedza', region: 'Central', type: 'Village' },
    { name: 'Mtendere', district: 'Dedza', region: 'Central', type: 'Village' },
    { name: 'Mua Mission', district: 'Dedza', region: 'Central', type: 'Mission' },

    // CENTRAL REGION - NTCHEU DISTRICT
    { name: 'Ntcheu Boma', district: 'Ntcheu', region: 'Central', type: 'Boma' },
    { name: 'Kasinje', district: 'Ntcheu', region: 'Central', type: 'Trading Centre' },
    { name: 'Biriwiri', district: 'Ntcheu', region: 'Central', type: 'Village' },
    { name: 'Lizulu', district: 'Ntcheu', region: 'Central', type: 'Village' },
    { name: 'Tsangano', district: 'Ntcheu', region: 'Central', type: 'Border Post' },
    { name: 'Njolomole', district: 'Ntcheu', region: 'Central', type: 'Village' },
    { name: 'Sharpe Valley', district: 'Ntcheu', region: 'Central', type: 'Village' },
    { name: 'Makwangwala', district: 'Ntcheu', region: 'Central', type: 'Village' },

    // SOUTHERN REGION - MANGOCHI DISTRICT
    { name: 'Mangochi Town', district: 'Mangochi', region: 'Southern', type: 'Town' },
    { name: 'Monkey Bay', district: 'Mangochi', region: 'Southern', type: 'Town' },
    { name: 'Cape Maclear', district: 'Mangochi', region: 'Southern', type: 'Village' },
    { name: 'Chembe', district: 'Mangochi', region: 'Southern', type: 'Village' },
    { name: 'Namwera', district: 'Mangochi', region: 'Southern', type: 'Village' },
    { name: 'Malombe', district: 'Mangochi', region: 'Southern', type: 'Village' },
    { name: 'Makokola', district: 'Mangochi', region: 'Southern', type: 'Village' },
    { name: 'Makanjira', district: 'Mangochi', region: 'Southern', type: 'Village' },
    { name: 'Katuli', district: 'Mangochi', region: 'Southern', type: 'Village' },
    { name: 'Nankumba', district: 'Mangochi', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - MACHINGA DISTRICT
    { name: 'Liwonde', district: 'Machinga', region: 'Southern', type: 'Town' },
    { name: 'Machinga Boma', district: 'Machinga', region: 'Southern', type: 'Boma' },
    { name: 'Ntaja', district: 'Machinga', region: 'Southern', type: 'Trading Centre' },
    { name: 'Nayuchi Border', district: 'Machinga', region: 'Southern', type: 'Border Post' },
    { name: 'Namandanje', district: 'Machinga', region: 'Southern', type: 'Village' },
    { name: 'Nselema', district: 'Machinga', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - ZOMBA DISTRICT
    { name: 'Zomba City', district: 'Zomba', region: 'Southern', type: 'City' },
    { name: 'Thondwe', district: 'Zomba', region: 'Southern', type: 'Trading Centre' },
    { name: 'Jali', district: 'Zomba', region: 'Southern', type: 'Village' },
    { name: 'Matawale', district: 'Zomba', region: 'Southern', type: 'Village' },
    { name: 'Songani', district: 'Zomba', region: 'Southern', type: 'Village' },
    { name: 'Domasi', district: 'Zomba', region: 'Southern', type: 'Village' },
    { name: 'Chancellor College', district: 'Zomba', region: 'Southern', type: 'Town' },
    { name: 'Malosa', district: 'Zomba', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - CHIRADZULU DISTRICT
    { name: 'Chiradzulu Boma', district: 'Chiradzulu', region: 'Southern', type: 'Boma' },
    { name: 'Thumbwe', district: 'Chiradzulu', region: 'Southern', type: 'Village' },
    { name: 'Namitambo', district: 'Chiradzulu', region: 'Southern', type: 'Village' },
    { name: 'Sandar', district: 'Chiradzulu', region: 'Southern', type: 'Village' },
    { name: 'Mombezi', district: 'Chiradzulu', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - BLANTYRE DISTRICT
    { name: 'Blantyre City', district: 'Blantyre', region: 'Southern', type: 'City' },
    { name: 'Limbe', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Ndirande', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Bangwe', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Machinjiri', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Chirimba', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Chileka', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Soche', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Chinyonga', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Kanjedza', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Mandala', district: 'Blantyre', region: 'Southern', type: 'Town' },
    { name: 'Lunzu', district: 'Blantyre', region: 'Southern', type: 'Trading Centre' },
    { name: 'Lirangwe', district: 'Blantyre', region: 'Southern', type: 'Village' },
    { name: 'Mpemba', district: 'Blantyre', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - MULANJE DISTRICT
    { name: 'Mulanje Boma', district: 'Mulanje', region: 'Southern', type: 'Boma' },
    { name: 'Likhubula', district: 'Mulanje', region: 'Southern', type: 'Village' },
    { name: 'Chonde', district: 'Mulanje', region: 'Southern', type: 'Village' },
    { name: 'Manase', district: 'Mulanje', region: 'Southern', type: 'Village' },
    { name: 'Thuchila', district: 'Mulanje', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - THYOLO DISTRICT
    { name: 'Thyolo Boma', district: 'Thyolo', region: 'Southern', type: 'Boma' },
    { name: 'Bvumbwe', district: 'Thyolo', region: 'Southern', type: 'Trading Centre' },
    { name: 'Thekerani', district: 'Thyolo', region: 'Southern', type: 'Village' },
    { name: 'Thyolo Trading', district: 'Thyolo', region: 'Southern', type: 'Trading Centre' },
    { name: 'Goliati', district: 'Thyolo', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - PHALOMBE DISTRICT
    { name: 'Phalombe Boma', district: 'Phalombe', region: 'Southern', type: 'Boma' },
    { name: 'Milepa', district: 'Phalombe', region: 'Southern', type: 'Village' },
    { name: 'Nambiti', district: 'Phalombe', region: 'Southern', type: 'Village' },
    { name: 'Nazombe', district: 'Phalombe', region: 'Southern', type: 'Village' },
    { name: 'Chitekesa', district: 'Phalombe', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - CHIKWAWA DISTRICT
    { name: 'Chikwawa Boma', district: 'Chikwawa', region: 'Southern', type: 'Boma' },
    { name: 'Nchalo', district: 'Chikwawa', region: 'Southern', type: 'Town' },
    { name: 'Bereu', district: 'Chikwawa', region: 'Southern', type: 'Village' },
    { name: 'Ngabu', district: 'Chikwawa', region: 'Southern', type: 'Trading Centre' },
    { name: 'Kasinthula', district: 'Chikwawa', region: 'Southern', type: 'Village' },
    { name: 'Makhanga', district: 'Chikwawa', region: 'Southern', type: 'Village' },

    // SOUTHERN REGION - NSANJE DISTRICT
    { name: 'Nsanje Boma', district: 'Nsanje', region: 'Southern', type: 'Boma' },
    { name: 'Bangula', district: 'Nsanje', region: 'Southern', type: 'Town' },
    { name: 'Tengani', district: 'Nsanje', region: 'Southern', type: 'Village' },
    { name: 'Fatima', district: 'Nsanje', region: 'Southern', type: 'Village' },
    { name: 'Marka Border', district: 'Nsanje', region: 'Southern', type: 'Border Post' },
    { name: 'Mbenje', district: 'Nsanje', region: 'Southern', type: 'Village' },
];

/**
 * Search locations by name or district
 * @param query - Search term
 * @param limit - Maximum number of results to return
 * @returns Array of matching locations
 */
export const searchLocations = (query: string, limit: number = 10): Location[] => {
    if (!query || query.trim().length === 0) return [];

    const lowerQuery = query.toLowerCase().trim();

    // Filter and score results
    const results = MALAWI_LOCATIONS
        .map(loc => {
            const nameLower = loc.name.toLowerCase();
            const districtLower = loc.district.toLowerCase();

            // Exact match gets highest score
            if (nameLower === lowerQuery) return { loc, score: 100 };

            // Starts with query gets high score
            if (nameLower.startsWith(lowerQuery)) return { loc, score: 90 };

            // Contains query in name
            if (nameLower.includes(lowerQuery)) return { loc, score: 70 };

            // District starts with query
            if (districtLower.startsWith(lowerQuery)) return { loc, score: 60 };

            // District contains query
            if (districtLower.includes(lowerQuery)) return { loc, score: 50 };

            return null;
        })
        .filter((result): result is { loc: Location; score: number } => result !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(result => result.loc);

    return results;
};

/**
 * Get all locations for a specific district
 */
export const getLocationsByDistrict = (district: string): Location[] => {
    return MALAWI_LOCATIONS.filter(loc =>
        loc.district.toLowerCase() === district.toLowerCase()
    );
};

/**
 * Get all locations for a specific region
 */
export const getLocationsByRegion = (region: 'Northern' | 'Central' | 'Southern'): Location[] => {
    return MALAWI_LOCATIONS.filter(loc => loc.region === region);
};

/**
 * Get all unique districts
 */
export const getAllDistricts = (): string[] => {
    return Array.from(new Set(MALAWI_LOCATIONS.map(loc => loc.district))).sort();
};
