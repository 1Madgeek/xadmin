import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Block, StoreWrap, app } from 'xadmin'

const Model = (modelOrName, props={}) => {
  const { key, persist, initialValues, modelProps } = props

  class ModelComponent extends React.Component {

    model = null

    componentWillMount() {
      const { store } = this.context
      this.model = _.isString(modelOrName) ? this.getModel(modelOrName) : {
        ...modelOrName,
        key: key || modelOrName.name,
        ...modelProps
      }
      let initial = initialValues
      if(!initial && this.model.initialValues) {
        initial = _.isFunction(this.model.initialValues) ? this.model.initialValues() : this.model.initialValues
      }
      store.dispatch({ type: 'INITIALIZE', model: this.model, initial })
    }

    componentWillUnmount() {
      if(persist === false) {
        const { store } = this.context
        setTimeout(() => store.dispatch({ type: 'DESTROY', model: this.model }), 500)
        
      } 
    }

    getChildContext() {
      return { model: this.model }
    }

    render() {
      return this.props.children
    }

    getModel(name) {
      const model = app.load_dict('models')[name]
      model.name = model.name || name
      return model ? {
        ...model,
        key: key || model.name,
        ...modelProps
      } : null
    }
    
  }

  ModelComponent.contextTypes = {
    store: PropTypes.object.isRequired
  }

  ModelComponent.childContextTypes = {
    model: PropTypes.object.isRequired
  }

  return ModelComponent
}

const ModelWrap = StoreWrap({
  contextTypes: {
    model: PropTypes.object.isRequired
  },
  getState: (context) => {
    const { store, model } = context
    return { modelState: store.getState().model[model.key], model }
  },
  computeProps: (tag, { model }) => {
    const ret = { model }
    if(model.components && model.components[tag]) {
      ret['componentClass'] = model.components[tag]
    }
    return ret
  }
})

export {
  ModelWrap,
  Model
}
