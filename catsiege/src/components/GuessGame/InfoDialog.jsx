import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";

export const InfoDialog = ({ isOpen, onOpenChange, TURN_MULTIPLIERS }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[#1a1a1a] rounded-lg p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold text-[#FFF5E4] mb-4">
            How to Play
          </Dialog.Title>

          <div className="space-y-4 text-[#FFF5E4]/80">
            <p>🎯 Guess the secret number between 1 and 256.</p>
            <p>🤖 You'll play against a CPU that takes turns after you.</p>
            <p>⚡ Every turn you make weakens your reward multiplier.</p>
            <p>💫 CPU turns don't affect your multiplier.</p>

            <Accordion.Root type="single" collapsible>
              <Accordion.Item value="multipliers">
                <Accordion.Trigger className="flex justify-between w-full py-2 text-[#FBE294]">
                  View Multiplier Table
                  <span>▼</span>
                </Accordion.Trigger>
                <Accordion.Content className="pt-2">
                  <div className="bg-[#FFF5E4]/5 rounded p-3 space-y-1">
                    {Object.entries(TURN_MULTIPLIERS).map(
                      ([turn, multiplier]) => (
                        <div
                          key={turn}
                          className="flex justify-between text-sm"
                        >
                          <span>Turn {parseInt(turn)}</span>
                          <span className="text-[#FBE294]">x{multiplier}</span>
                        </div>
                      )
                    )}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>

          <Dialog.Close asChild>
            <button className="mt-6 w-full py-2 px-4 bg-[#FFF5E4]/10 hover:bg-[#FFF5E4]/20 rounded transition-colors text-[#FFF5E4]">
              Got it!
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
