import React, { useState, useEffect } from 'react'
import * as R from 'ramda'
import * as B from 'baconjs'

const offsetBus = new B.Bus<number>()

type Props<T> = {
  itemsPerPage: number
  items: T[]
  renderFn: (item: T) => any
}

export default <T extends Object>(props: Props<T>) => {
  const [offset, setOffset] = useState(props.itemsPerPage)

  useEffect(() => {
    offsetBus
      .skipDuplicates()
      .throttle(1000)
      .onValue(v => setOffset(v))
  }, [])

  const items = R.take(offset, props.items)
  const elem: React.RefObject<HTMLDivElement> = React.createRef()
  return (
    <div
      onScroll={() => {
        const limitReaced =
          elem.current.getBoundingClientRect().height - elem.current.scrollTop <
          100
        if (limitReaced) {
          offsetBus.push(offset + props.itemsPerPage)
        }
      }}
      ref={elem}
      style={{ maxHeight: '400px', overflow: 'auto' }}
    >
      {items.map(props.renderFn)}
    </div>
  )
}
