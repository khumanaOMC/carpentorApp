import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";

type SectionCardProps = {
  title: string;
  subtitle: string;
  items: string[];
};

export function SectionCard({ title, subtitle, items }: SectionCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.2 }}>
          {subtitle}
        </Typography>
        <List disablePadding>
          {items.map((item) => (
            <ListItem key={item} disableGutters sx={{ py: 0.35 }}>
              <ListItemIcon sx={{ minWidth: 24 }}>
                <KeyboardArrowRightRoundedIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
