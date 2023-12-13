/* Class style */
import { useEffect, useState, Component } from "react"

export default class Accounts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      counter: 0
    }
  }
  counterUp() {
    this.setState(() => ({
      counter: this.state.counter + 1
    }))
  }
  render() {
    const {
      counter
    } = this.state
    
    return (
      <>
        <div>Accounts</div>
        <a onClick={this.counterUp.bind(this)}>[Counter: {counter}]</a>
      </>
    )
  }
}