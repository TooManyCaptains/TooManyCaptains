import React from 'react'
import { isEqual } from 'lodash'

// import ColorChartNone from './images/attri_None.png'
// import ColorChartR from './images/attri_R.png'
// import ColorChartB from './images/attri_B.png'
// import ColorChartY from './images/attri_Y.png'
// import ColorChartBR from './images/attri_RB.png'
// import ColorChartBY from './images/attri_BY.png'
// import ColorChartRY from './images/attri_RY.png'
// import ColorChartBRY from './images/attri_RYB.png'

const colorChartMap = [
  {
    colors: [],
    chart: ColorChartNone,
  },
  {
    colors: ['blue'],
    chart: ColorChartB,
  },
  {
    colors: ['red'],
    chart: ColorChartR,
  },
  {
    colors: ['yellow'],
    chart: ColorChartY,
  },
  {
    colors: ['blue', 'yellow'],
    chart: ColorChartBY,
  },
  {
    colors: ['blue', 'red'],
    chart: ColorChartBR,
  },
  {
    colors: ['red', 'yellow'],
    chart: ColorChartRY,
  },
  {
    colors: ['blue', 'red', 'yellow'],
    chart: ColorChartBRY,
  },
]

const colorChartForColors = colors => {
  colors.sort()
  return colorChartMap.find(map => isEqual(map.colors, colors)).chart
}

const ColorChart = ({ colors }) => {
  return (
    <div className="ColorChart">
      <img src={colorChartForColors(colors)}/>
    </div>
  )
}
export default ColorChart
