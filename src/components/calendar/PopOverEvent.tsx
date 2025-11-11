
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
const PopOverEvent = ({ popoverOpen, setPopoverOpen, popoverPosition }: any) => {
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        {/* Hidden trigger - popover controlled by state */}
        <div style={{ display: "none" }} />
      </PopoverTrigger>
      <PopoverContent className="w-80"  style={{
            position: 'fixed',
            top: popoverPosition.y,
            left: popoverPosition.x,
          }}>
        <div className="grid gap-4">
          <h1>PopOver opened</h1>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PopOverEvent;
