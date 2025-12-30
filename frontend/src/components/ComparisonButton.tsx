import { useContext } from "react";
import { ComparisonContext } from "@/context/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale3d } from "lucide-react";

interface ComparisonButtonProps {
  onOpenComparison: () => void;
}

const ComparisonButton = ({ onOpenComparison }: ComparisonButtonProps) => {
  const comparisonContext = useContext(ComparisonContext);

  if (!comparisonContext) {
    throw new Error("ComparisonButton must be used within ComparisonProvider");
  }

  const { compareProducts } = comparisonContext;

  if (compareProducts.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={onOpenComparison}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center justify-center p-0 group"
      title={`So sánh ${compareProducts.length} sản phẩm`}
    >
      <div className="relative flex items-center justify-center">
        <Scale3d className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-0 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold">
          {compareProducts.length}
        </Badge>
      </div>
    </Button>
  );
};

export default ComparisonButton;
