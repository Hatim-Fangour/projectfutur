import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Columns4,
  Eye,
  GalleryVertical,
  Grid3x3,
  Plus,
} from "lucide-react";
import React, { useState } from "react";
import { Views } from "react-big-calendar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const CustomToolbar = ({ label, onNavigate, onView }: any) => {
  const [anchorElViewSelector, setAnchorElViewSelector] = useState<
    boolean | null
  >(false);
  const open = Boolean(anchorElViewSelector);

  const onClickViewSelector = (event: any) => {
    setAnchorElViewSelector(event.currentTarget);
  };
  const handleCloseViewSelector = () => setAnchorElViewSelector(null);
  // console.log(Views);

  const viewsMenu = [
    {
      id: 1,
      name: "Day",
      icon: <GalleryVertical className="h-4 w-4 text-gray-500" />,
      action: () => onView(Views.DAY),
    },
    {
      id: 2,
      name: "Week",
      icon: <Columns4 className="h-4 w-4 text-gray-500" />,
      action: () => onView(Views.WEEK),
    },
    {
      id: 3,
      name: "Month",
      icon: <Grid3x3 className="h-4 w-4 text-gray-500" />,
      action: () => onView(Views.MONTH),
    },
    {
      id: 4,
      name: "Agenda",
      icon: <Columns3 className="h-4 w-4 text-gray-500" />,
      action: () => onView(Views.AGENDA),
    },
  ];
  return (
    <div className="rbc-toolbr flex justify-between items-center p-2 mb-3">
      {/* Left buttons */}
      <div className="space-x-1 flex items-center">
        <Button onClick={() => onNavigate("PREV")} className="btn">
          <ChevronLeft />
        </Button>
        <Button onClick={() => onNavigate("TODAY")} className="btn">
          Today
        </Button>
        <Button onClick={() => onNavigate("NEXT")} className="btn">
          <ChevronRight />
        </Button>
      </div>

      {/* Label */}
      <span className="text-lg font-bold">{label}</span>

      {/* View switcher */}
      <div className="space-x-1 flex items-center">
        {/* code color */}
        <div>
          {/* Button with selected color */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button onClick={onClickViewSelector}>
                <Eye className="h-5 w-5" />
              </Button>
              {/* <Button className="rounded-full">+</Button> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={10}
              side="left"
              className=""
              align="start"
            >
              {viewsMenu.map((view, index) => (
                <DropdownMenuItem onSelect={() => console.log("service")}>
                  {view.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown menu */}
          {/* <Menu
            anchorEl={anchorElViewSelector}
            open={open}
            onClose={handleCloseViewSelector}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <div
              sx={{
                display: "flex",
                flexDirection: "column",
                p: 1,
                gap: 0.5,
              }}
            >
              {viewsMenu.map((view, index) => (
                <MenuItem
                  key={index}
                  onClick={view.action}
                  sx={{
                    width: "150px",
                    minWidth: 0,
                    p: 0.5,
                    paddingX: 1,
                    borderRadius: "8px",
                  }}
                >
                  <div
                    sx={{
                      height: 24,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span>{view.icon}</span>
                      <span>{view.name}</span>
                    </div>
                    <span>{view.name.charAt(0)}</span>
                  </div>
                </MenuItem>
              ))}
            </div>
          </Menu> */}
        </div>

        <Button
          onClick={() => onView(Views.MONTH)}
          //   className="btn border border-1 py-[2px] px-3 rounded-md"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CustomToolbar;
