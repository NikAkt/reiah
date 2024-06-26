import { onMount } from "solid-js"
import Sortable from "sortablejs"

export const SortableGroup = (props) => {
  let ref
  onMount(() => {
    Sortable.create(ref)
  })
  return (
    <div class={props.class} ref={ref}>
      {props.children}
    </div >
  )
}
