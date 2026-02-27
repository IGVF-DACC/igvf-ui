import { SelectMenu } from "./select-menu";
import { Trigger } from "./trigger";
import { Items } from "./items";
import { Item } from "./item";
import { Separator } from "./separator";

const SelectMenuComposed = Object.assign(SelectMenu, {
  Trigger,
  Items,
  Item,
  Separator,
});

export { SelectMenuComposed as SelectMenu };
