const { getProjectData } = require('../database')

const counter = async (req, res, next) => {
    const ProjectData = await getProjectData()    
    const CountryDict = Object()
    const SectorDict = Object()
    let delayn = 0, canceln = 0, maxKey = undefined

    ProjectData.forEach(prj => {
        const {country, ppi_status, sector} = prj.properties
        CountryDict[country] = true
        if (ppi_status.toLowerCase() === 'delayed') delayn += 1
        if (ppi_status.toLowerCase() === 'cancelled') canceln += 1
        SectorDict[sector] = (SectorDict[sector] || 0) + 1
    })

    //find key with max value in SectorDict
    Object.keys(SectorDict).forEach(sector => {
        if(maxKey === undefined) maxKey = sector
        if(SectorDict[maxKey] < SectorDict[sector]) maxKey = sector
    })

    res.locals.countryn = Object.keys(CountryDict).length
    res.locals.delayn = delayn
    res.locals.canceln = canceln
    res.locals.sector = maxKey 
    
    next()
}

module.exports = {
    counter
}