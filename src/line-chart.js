import React from 'react'
import { View } from 'react-native'
import {
  Svg,
  Circle,
  Polygon,
  Polyline,
  Path,
  Rect,
  G
} from 'react-native-svg'
import AbstractChart from './abstract-chart'

class LineChart extends AbstractChart {

  getColor = (dataset, opacity) => {
    return (dataset.color || this.props.chartConfig.color)(opacity)
  }

  getStrokeWidth = (dataset) => {
    return (dataset.strokeWidth || this.props.chartConfig.strokeWidth || 3)
  }

  getDatas = data => data.reduce((acc, item) => item.data ? [...acc, ...item.data] : acc,[])

  renderDots = config => {
    const { data, width, height, paddingTop, paddingRight } = config
    let output = [];
    const datas = this.getDatas(data)
    data.map((dataset,index)=>{
      dataset.data.map((x, i) => {
        output.push (
          <Circle
            key={Math.random()}
            cx={paddingRight + (i * (width - paddingRight) / dataset.data.length)}
            cy={((height / 4 * 3 * (1 - ((x - Math.min(...datas)) / this.calcScaler(datas)))) + paddingTop)}
            r="4"
            fill={this.getColor(dataset, 0.7)}
          />)
      })
    })
    return (
      output
    )
  }

  renderShadow = config => {
    if (this.props.bezier) {
      return this.renderBezierShadow(config)
    }
    const { data, width, height, paddingRight, paddingTop } = config
    let output = [];
    const datas = this.getDatas(data)
    config.data.map((dataset,index)=>{
      output.push (
        <Polygon
          key={index}
          points={dataset.data.map((x, i) =>
            (paddingRight + (i * (width - paddingRight) / dataset.data.length)) +
          ',' +
           (((height / 4 * 3 * (1 - ((x - Math.min(...datas)) / this.calcScaler(datas)))) + paddingTop))
          ).join(' ') + ` ${paddingRight + ((width - paddingRight) / dataset.data.length * (dataset.data.length - 1))},${(height / 4 * 3) + paddingTop} ${paddingRight},${(height / 4 * 3) + paddingTop}`}
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />)
    })
    return (
      output
    )
  }

  renderLine = config => {
    if (this.props.bezier) {
      return this.renderBezierLine(config)
    }
    const { width, height, paddingRight, paddingTop, data } = config
    let output = [];
    const datas = this.getDatas(data)
    data.map((dataset,index) => {

      const points = dataset.data.map((x, i) =>
      (paddingRight + (i * (width - paddingRight) / dataset.data.length)) +
      ',' +
       (((height / 4 * 3 * (1 - ((x - Math.min(...datas)) / this.calcScaler(datas))))) + paddingTop))

      output.push (
        <Polyline
          key = {index}
          points={points.join(' ')}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />
      )

    })

    return (
      output
    )
  }

  getBezierLinePoints = (dataset, config) => {

    const { width, height, paddingRight, paddingTop, data } = config
    let output = [];
    if (dataset.data.length === 0) {
      return 'M0,0'
    }

    const datas = this.getDatas(data)
    const x = i => Math.floor(paddingRight + i * (width - paddingRight) / dataset.data.length)
    const y = i => Math.floor(((height / 4 * 3 * (1 - ((dataset.data[i] - Math.min(...datas)) / this.calcScaler(datas)))) + paddingTop))

    return [`M${x(0)},${y(0)}`].concat(dataset.data.slice(0, -1).map((_, i) => {
      const x_mid = (x(i) + x(i + 1)) / 2
      const y_mid = (y(i) + y(i + 1)) / 2
      const cp_x1 = (x_mid + x(i)) / 2
      const cp_x2 = (x_mid + x(i + 1)) / 2
      return `Q ${cp_x1}, ${y(i)}, ${x_mid}, ${y_mid}` +
      ` Q ${cp_x2}, ${y(i + 1)}, ${x(i + 1)}, ${y(i + 1)}`
    })).join(' ')
  }

  renderBezierLine = config => {
    let output = [];
    config.data.map((dataset,index)=>{
      let result = this.getBezierLinePoints(dataset,config);
      output.push (
          <Path
            key = {index}
            d={result}
            fill="none"
            stroke={this.getColor(dataset, 0.2)}
            strokeWidth={this.getStrokeWidth(dataset)}
          />
        )
      });
    return (
      output
    )
  }

  renderBezierShadow = config => {
    const { width, height, paddingRight, paddingTop, data } = config
    let output = [];
    data.map((dataset,index)=>{
      let d = this.getBezierLinePoints(dataset,config) +
      ` L${paddingRight + ((width - paddingRight) / dataset.data.length * (dataset.data.length - 1))},${(height / 4 * 3) + paddingTop} L${paddingRight},${(height / 4 * 3) + paddingTop} Z`
      output.push (
        <Path
          key={index}
          d={d}
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />)
    })
    return (
      output
    )
  }

  render() {
    const paddingTop = 16
    const paddingRight = 64
    const { width, height, data, withShadow = true, withDots = true, withInnerLines = true, style = {}, decorator } = this.props
    const { labels = [] } = data
    const { borderRadius = 0 } = style
    const config = {
      width,
      height
    }
    const datas = this.getDatas(data.datasets)
    return (
      <View style={style}>
        <Svg
          height={height}
          width={width}
        >
          <G>
            {this.renderDefs({
              ...config,
              ...this.props.chartConfig
            })}
            <Rect
              width="100%"
              height={height}
              rx={borderRadius}
              ry={borderRadius}
              fill="url(#backgroundGradient)"/>
            <G>
                {withInnerLines
                    ? this.renderHorizontalLines({
                        ...config,
                        count: 4,
                        paddingTop,
                        paddingRight
                    })
                    : this.renderHorizontalLine({
                        ...config,
                        paddingTop,
                        paddingRight
                    })
                }
            </G>
            <G>
            {this.renderHorizontalLabels({
              ...config,
              count: (Math.min(...datas) === Math.max(...datas)) ?
                1 : 4,
              data: datas,
              paddingTop,
              paddingRight
            })}
            </G>
            <G>
                {withInnerLines
                    ? this.renderVerticalLines({
                        ...config,
                        data: data.datasets[0].data,
                        paddingTop,
                        paddingRight
                    })
                    : this.renderVerticalLine({
                        ...config,
                        paddingTop,
                        paddingRight
                    })
                }
            </G>
            <G>
            {this.renderVerticalLabels({
              ...config,
              labels,
              paddingRight,
              paddingTop
            })}
            </G>
            <G>
            {this.renderLine({
              ...config,
              paddingRight,
              paddingTop,
              // data: data.datasets[0].data
              data: data.datasets

            })}
            </G>
            <G>
            {withShadow && this.renderShadow({
              ...config,
              data: data.datasets,
              paddingRight,
              paddingTop
            })}
            </G>
            <G>
            {withDots && this.renderDots({
              ...config,
              data: data.datasets,
              paddingTop,
              paddingRight
            })}
            </G>
            <G>
            {decorator && decorator({
              ...config,
              data: data.datasets,
              paddingTop,
              paddingRight
            })}
            </G>
          </G>
        </Svg>
      </View>
    )
  }
}

export default LineChart
