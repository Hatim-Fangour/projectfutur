import React from "react";

const NoteTabContent = ({ customer }: any) => {
  return (
    <div className="notes-history">
      <div className="title mb-3">Notes</div>

      {/* <Box
        sx={{
          width: "100%",
          maxHeight: "400px", // Fixed height
          overflowY: "auto", // Vertical scroll
          pr: 1, // Add padding to prevent scrollbar overlap
        }}
      > */}
        {customer?.notes?.length === 0 ? (
          <p className="emptyCartText">You don't have any notes</p>
        ) : (
            <h1>{customer.notes[0].content}</h1>
        //   <Stack spacing={2} p={1}>
        //     {(() => {
        //       const selectedOne =
        //         customerCRUDHook.filteredCustomers?.find(
        //           (c) => c.id === selectedCustomer?.id
        //         ) ??
        //         selectedCustomer ??
        //         null;
              
        //       return selectedOne?.notes?.map((note) => (
        //         <NoteCard
        //           key={note.id}
        //           note={note}
        //         />
        //       ));
        //     })()}

        //     {}
        //   </Stack>
        )}
      {/* </Box> */}
    </div>
  );
};

export default NoteTabContent;
