#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "fileutils"

MONTHS = %w[
  January February March April May June
  July August September October November December
].freeze

SOURCES = {
  "books" => "books/2026.md",
  "courses" => "courses/2026.md",
  "events" => "events/2026.md",
  "webinars" => "webinars/2026.md"
}.freeze

def links_from(text)
  text.scan(/\[([^\]]+)\]\(([^)]+)\)/).map do |label, url|
    { label: label, url: url }
  end
end

def clean_text(text)
  text
    .gsub(/\[([^\]]+)\]\([^)]+\)/, "")
    .gsub(/\*\*([^*]+)\*\*/, '\1')
    .gsub(/\s+/, " ")
    .gsub(/\A\s*[-–—]\s*/, "")
    .gsub(/\s*[-–—]\s*\z/, "")
    .strip
end

def parse_entry(type, line, month, year)
  raw = line.sub(/\A-\s*/, "").strip
  return if raw.empty?

  links = links_from(raw)
  date = raw[/\((\d{2}\.\d{2}\.#{year}(?:\s*[-–—]\s*\d{2}\.\d{2}\.#{year})?)\)/, 1]

  if type == "books"
    title, separator, author = raw.rpartition(" - ")
    title = raw if separator.empty?

    return {
      type: type,
      month: month,
      month_index: MONTHS.index(month),
      year: year,
      title: clean_text(title),
      meta: separator.empty? ? "" : clean_text(author),
      date: nil,
      links: links
    }
  end

  title = raw[/\A\*\*([^*]+)\*\*/, 1]
  title ||= raw.split(/\s+\(\d{2}\.\d{2}\.#{year}/, 2).first
  remainder = raw.sub(/\A\*\*[^*]+\*\*/, "").sub(/\A#{Regexp.escape(title)}/, "")
  remainder = remainder.sub(/\s*\(#{Regexp.escape(date)}\)/, "") if date

  {
    type: type,
    month: month,
    month_index: MONTHS.index(month),
    year: year,
    title: clean_text(title),
    meta: clean_text(remainder),
    date: date,
    links: links
  }
end

activities = []

SOURCES.each do |type, path|
  month = nil
  year = File.read(path)[/^#\s+(\d{4})/, 1].to_i

  File.readlines(path, chomp: true).each do |line|
    if (heading = line.match(/^###\s+(.+)$/))
      month = heading[1]
      next
    end

    next unless month && line.start_with?("-")

    entry = parse_entry(type, line, month, year)
    activities << entry if entry
  end
end

activities.sort_by! do |item|
  date_parts = item[:date]&.scan(/\d+/)&.first(3)&.map(&:to_i)
  day = date_parts ? date_parts.first : 1
  [item[:month_index], day, item[:type], item[:title]]
end

summary = SOURCES.keys.to_h do |type|
  [type, activities.count { |item| item[:type] == type }]
end
payload = {
  year: activities.map { |item| item[:year] }.max,
  generated_at: Time.now.utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
  summary: summary,
  activities: activities
}

FileUtils.mkdir_p("src")
File.write("src/data.json", "#{JSON.pretty_generate(payload)}\n")

puts "Generated #{activities.size} activities in src/data.json"
