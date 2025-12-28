// src/drag-list.ts
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/adapter";

type Item = {
  id: string;
  text: string;
  el: HTMLLIElement;
};

export function initDragList(): void {
  const listEl = document.getElementById("todo-list") as HTMLUListElement | null;
  console.log("drag-list script loaded, listEl:", listEl);

  if (!listEl) return;

  const items: Item[] = Array.from(
    listEl.querySelectorAll<HTMLLIElement>(".draggable-item")
  ).map((el) => ({
    id: el.dataset.id ?? "",
    text: el.textContent ?? "",
    el,
  }));

  function renderList(): void {
    if (!listEl) return;
    listEl.innerHTML = "";
    for (const item of items) {
      listEl.appendChild(item.el);
    }
  }


  // Make items draggable
  items.forEach((item) => {
    draggable({
      element: item.el,
      getInitialData: () => ({ id: item.id }),
      onDragStart: () => {
        item.el.classList.add("dragging");
      },
      onDrop: () => {
        item.el.classList.remove("dragging");
      },
    });
  });

  // Make each item a drop target
  items.forEach((item, index) => {
    dropTargetForElements({
      element: item.el,
      getData: () => ({ index }),
    });
  });

  // List as a drop target (end of list)
  dropTargetForElements({
    element: listEl,
    getData: () => ({ index: items.length }),
  });

  // Monitor drops and reorder items
  monitorForElements({
    onDrop({ source, location }) {
      const sourceId = (source.data as { id?: string }).id;
      if (!sourceId) return;

      const destination = location.current.dropTargets[0];
      if (!destination) return;

      const destinationIndex = (destination.data as { index: number }).index;
      const startIndex = items.findIndex((i) => i.id === sourceId);
      if (startIndex === -1) return;

      if (startIndex === destinationIndex) return;

      const [moved] = items.splice(startIndex, 1);
      let finalIndex =
        destinationIndex > startIndex ? destinationIndex - 1 : destinationIndex;

      if (finalIndex < 0) finalIndex = 0;
      if (finalIndex > items.length) finalIndex = items.length;

      items.splice(finalIndex, 0, moved);
      renderList();
    },
  });
}
