import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-3xl">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is TrustWork?</AccordionTrigger>
        <AccordionContent>
          TrustWork is a decentralized freelance platform built on the Stellar network. We connect freelancers and clients using smart contract escrows to ensure trustless, secure payments without the heavy platform fees of traditional networks.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-2">
        <AccordionTrigger>How do payments and escrows work?</AccordionTrigger>
        <AccordionContent>
          When a job begins, the client deposits the payment into a secure, decentralized smart contract escrow. The funds are only released to the freelancer once the work is completed and approved, guaranteeing peace of mind for both parties.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-3">
        <AccordionTrigger>Are there any platform fees?</AccordionTrigger>
        <AccordionContent>
          No! Unlike traditional freelance platforms that take up to 20% of your hard-earned money, TrustWork charges zero platform fees. You keep exactly what you earn, only paying the negligible network transaction fees on the Stellar blockchain.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4">
        <AccordionTrigger>What happens if there is a dispute?</AccordionTrigger>
        <AccordionContent>
          If a disagreement occurs, our decentralized arbitration system steps in. Independent, verified arbitrators review the project evidence and vote to resolve the dispute fairly, ensuring neither party can act maliciously.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-5">
        <AccordionTrigger>What wallet do I need to use TrustWork?</AccordionTrigger>
        <AccordionContent>
          Currently, you need the Freighter browser extension wallet. Freighter allows you to securely connect to TrustWork, sign transactions, and manage your escrow funds directly on the Stellar network.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export { AccordionDemo };
