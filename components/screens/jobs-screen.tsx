"use client";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  InputAdornment,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { JobCard } from "@/components/cards/job-card";
import { Pill } from "@/components/ui/pill";
import { getAuthUser } from "@/lib/auth-storage";
import { applyToJob, getJobs, type JobListItem } from "@/lib/api/marketplace";
import { useAppLanguage } from "@/components/providers/app-language-provider";
import { appDictionary } from "@/lib/i18n";

const filters = ["Delhi NCR", "Verified", "Daily wage", "Per sq ft", "Available now"];

export function JobsScreen() {
  const { language } = useAppLanguage();
  const dictionary = appDictionary[language];
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const deferredQuery = useDeferredValue(query);
  const authUser = getAuthUser();

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      setLoading(true);
      try {
        const response = await getJobs({ search: deferredQuery || undefined });
        if (active) {
          setJobs(Array.isArray(response.items) ? response.items : []);
          setMessage("");
        }
      } catch (error) {
        if (active) {
          setJobs([]);
          setMessage(error instanceof Error ? error.message : "Jobs load nahi ho paayi.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadJobs();
    return () => {
      active = false;
    };
  }, [deferredQuery]);

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const filteredJobs = safeJobs.filter((job) => {
    const matchesQuery =
      deferredQuery.trim().length === 0 ||
      job.title.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      job.city.toLowerCase().includes(deferredQuery.toLowerCase());

    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.every((filter) => {
        if (filter === "Verified") {
          return true;
        }

        if (filter === "Available now") {
          return job.status === "Open";
        }

        if (filter === "Daily wage") {
          return job.workType === "Daily wage";
        }

        if (filter === "Per sq ft") {
          return job.workType === "Per sq ft";
        }

        if (filter === "Delhi NCR") {
          return ["Delhi NCR", "Noida", "Gurugram", "Delhi"].includes(job.city);
        }

        return job.city === filter;
      });

    return matchesQuery && matchesFilters;
  });

  function toggleFilter(filter: string) {
    setSelectedFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]
    );
  }

  async function handleApply(jobId: string) {
    if (!authUser) {
      router.push("/login?redirect=/jobs");
      return;
    }

    try {
      await applyToJob({ jobId });
      setMessage("Application submit ho gayi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Apply fail ho gaya.");
    }
  }

  return (
    <MobileShell title="Jobs" subtitle="Apply for local or outstation work">
      <Stack spacing={2}>
        <TextField
          fullWidth
          placeholder={dictionary.jobs.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon color="action" />
              </InputAdornment>
            )
          }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilters.includes(filter) ? "contained" : "outlined"}
              onClick={() => toggleFilter(filter)}
              sx={{ minHeight: 34, px: 1.5 }}
            >
              {filter}
            </Button>
          ))}
          <Button startIcon={<TuneRoundedIcon />} variant="outlined" onClick={() => setFiltersOpen(true)}>
            {dictionary.jobs.moreFilters}
          </Button>
        </Stack>
        <Typography variant="subtitle1" fontWeight={700}>
          {dictionary.jobs.heading}
        </Typography>
        {loading ? <CircularProgress size={26} /> : null}
        <Stack spacing={1.5}>
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              {...job}
              onApply={handleApply}
              requiresLogin={!authUser}
              loginHref="/login?redirect=/jobs"
            />
          ))}
          {filteredJobs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {dictionary.jobs.empty}
            </Typography>
          ) : null}
        </Stack>

        <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} fullWidth>
          <DialogTitle>{dictionary.jobs.moreFilters}</DialogTitle>
          <DialogContent>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilters.includes(filter) ? "contained" : "outlined"}
                  onClick={() => toggleFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
              <Pill label={dictionary.jobs.pincodeNext} tone="outlined" />
              <Pill label={dictionary.jobs.budgetNext} tone="outlined" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedFilters([])}>{dictionary.jobs.clear}</Button>
            <Button variant="contained" onClick={() => setFiltersOpen(false)}>
              {dictionary.jobs.applyFilters}
            </Button>
          </DialogActions>
        </Dialog>
        {message ? (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        ) : null}
      </Stack>
    </MobileShell>
  );
}
